import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import { ClassifiedPriceType, ClassifiedCondition } from '../entities/classified.entity';

export class CreateClassifiedDto {
  @IsUUID()
  category_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  @MaxLength(10000)
  description!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(ClassifiedPriceType)
  price_type?: ClassifiedPriceType;

  @IsOptional()
  @IsEnum(ClassifiedCondition)
  condition?: ClassifiedCondition;

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
}
