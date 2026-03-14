import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCuisineDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
