import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ClassifiedPriceType,
  ClassifiedCondition,
  ClassifiedStatus,
} from '../entities/classified.entity';

export class UpdateClassifiedDto {
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number | null;

  @IsOptional()
  @IsEnum(ClassifiedPriceType)
  price_type?: ClassifiedPriceType;

  @IsOptional()
  @IsEnum(ClassifiedCondition)
  condition?: ClassifiedCondition | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsOptional()
  @IsObject()
  category_fields?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(ClassifiedStatus)
  status?: ClassifiedStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  moderator_notes?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
