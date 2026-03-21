import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { User, UserStatus } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationToken, TokenType } from './entities/verification-token.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(VerificationToken)
    private readonly verificationTokenRepository: Repository<VerificationToken>,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email.toLowerCase().trim());
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Create user
    const user = await this.usersService.create({
      email: dto.email.toLowerCase().trim(),
      password_hash: passwordHash,
      display_name: dto.display_name,
      status: UserStatus.INACTIVE,
    });

    // Generate verification token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    await this.verificationTokenRepository.save({
      user_id: user.id,
      token_hash: tokenHash,
      type: TokenType.EMAIL_VERIFICATION,
      expires_at: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    });

    // Send verification email (logs to console in dev)
    await this.emailService.sendVerificationEmail(user.email, rawToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user_id: user.id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesLeft = Math.ceil(
        (user.locked_until.getTime() - Date.now()) / (60 * 1000),
      );
      throw new UnauthorizedException(
        `Account is locked. Please try again in ${minutesLeft} minutes.`,
      );
    }

    // Check password
    if (!user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      // Increment login attempts
      const attempts = user.login_attempts + 1;
      const updateData: Partial<User> = { login_attempts: attempts };

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.locked_until = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
        this.logger.warn(`Account locked for user ${user.email} after ${attempts} failed attempts`);
      }

      await this.usersService.update(user.id, updateData);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.is_verified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in',
      );
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active');
    }

    // Reset login attempts and update last login
    await this.usersService.update(user.id, {
      login_attempts: 0,
      locked_until: null as unknown as Date,
      last_login_at: new Date(),
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: 604800, // 7 days
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    };
  }

  async refresh(refreshTokenValue: string) {
    const tokenHash = this.hashToken(refreshTokenValue);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token_hash: tokenHash },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revoked_at) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (storedToken.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = storedToken.user;
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Revoke old refresh token (token rotation)
    await this.refreshTokenRepository.update(storedToken.id, {
      revoked_at: new Date(),
    });

    // Generate new token pair
    const tokens = await this.generateTokens(user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: 604800, // 7 days
    };
  }

  async logout(userId: string, refreshTokenValue: string) {
    const tokenHash = this.hashToken(refreshTokenValue);

    await this.refreshTokenRepository.update(
      { token_hash: tokenHash, user_id: userId },
      { revoked_at: new Date() },
    );

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);

    const verificationToken = await this.verificationTokenRepository.findOne({
      where: {
        token_hash: tokenHash,
        type: TokenType.EMAIL_VERIFICATION,
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.used_at) {
      throw new BadRequestException('Verification token has already been used');
    }

    if (verificationToken.expires_at < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    // Mark token as used
    await this.verificationTokenRepository.update(verificationToken.id, {
      used_at: new Date(),
    });

    // Activate user
    await this.usersService.update(verificationToken.user_id, {
      is_verified: true,
      status: UserStatus.ACTIVE,
      email_verified_at: new Date(),
    });

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase().trim());

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    await this.verificationTokenRepository.save({
      user_id: user.id,
      token_hash: tokenHash,
      type: TokenType.PASSWORD_RESET,
      expires_at: new Date(
        Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
      ),
    });

    // Send reset email (logs to console in dev)
    await this.emailService.sendPasswordResetEmail(user.email, rawToken);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);

    const resetToken = await this.verificationTokenRepository.findOne({
      where: {
        token_hash: tokenHash,
        type: TokenType.PASSWORD_RESET,
      },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.used_at) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (resetToken.expires_at < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Mark token as used
    await this.verificationTokenRepository.update(resetToken.id, {
      used_at: new Date(),
    });

    // Update password
    await this.usersService.update(resetToken.user_id, {
      password_hash: passwordHash,
      login_attempts: 0,
      locked_until: null as unknown as Date,
    });

    // Revoke all refresh tokens for the user
    await this.refreshTokenRepository.update(
      { user_id: resetToken.user_id, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const rawRefreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(rawRefreshToken);

    await this.refreshTokenRepository.save({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ),
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
