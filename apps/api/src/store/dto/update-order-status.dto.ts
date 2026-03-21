import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status!: string;
}
