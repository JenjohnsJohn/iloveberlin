import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVideoSeriesDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUUID()
  thumbnail_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
