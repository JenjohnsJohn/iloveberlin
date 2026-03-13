import {
  IsString,
  IsInt,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class ConfirmMediaDto {
  @IsString()
  @MaxLength(500)
  storage_key!: string;

  @IsString()
  @MaxLength(255)
  original_filename!: string;

  @IsString()
  @MaxLength(100)
  mime_type!: string;

  @IsInt()
  @Min(0)
  file_size_bytes!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  height?: number;
}
