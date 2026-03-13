import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 0,
  [UserRole.EDITOR]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: AdminUserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    if (id === currentUser.id) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const target = await this.usersService.findById(id);
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      dto.role === UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only super admins can promote to super admin');
    }

    return this.usersService.update(id, { role: dto.role });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    if (id === currentUser.id) {
      throw new ForbiddenException('Cannot change your own status');
    }

    const target = await this.usersService.findById(id);
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role === UserRole.ADMIN &&
      ROLE_HIERARCHY[target.role] >= ROLE_HIERARCHY[UserRole.ADMIN]
    ) {
      throw new ForbiddenException('Admins cannot change the status of other admins or super admins');
    }

    return this.usersService.update(id, { status: dto.status });
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    if (id === currentUser.id) {
      throw new ForbiddenException('Cannot delete your own account from admin panel');
    }

    const target = await this.usersService.findById(id);
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (ROLE_HIERARCHY[target.role] >= ROLE_HIERARCHY[currentUser.role]) {
      throw new ForbiddenException('Cannot delete a user with equal or higher role');
    }

    await this.usersService.softDelete(id);
    return { message: 'User deleted successfully' };
  }
}
