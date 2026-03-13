import { IsEnum } from 'class-validator';
import { UserStatus } from '../../users/entities/user.entity';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}
