import {
  IsUUID,
  IsOptional,
  IsInt,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class AddRestaurantImageDto {
  @IsUUID()
  media_id!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  caption?: string;
}
