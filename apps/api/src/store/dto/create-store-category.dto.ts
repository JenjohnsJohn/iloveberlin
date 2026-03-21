import { IsString, IsOptional, IsInt, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateStoreCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}
