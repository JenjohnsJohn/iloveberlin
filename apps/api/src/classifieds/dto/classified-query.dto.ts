import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClassifiedCondition, ClassifiedStatus } from '../entities/classified.entity';

export enum ClassifiedSortField {
  DATE = 'date',
  PRICE = 'price',
  TITLE = 'title',
  CREATED = 'created',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ClassifiedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsEnum(ClassifiedCondition)
  condition?: ClassifiedCondition;

  @IsOptional()
  @IsEnum(ClassifiedStatus)
  status?: ClassifiedStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_max?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ClassifiedSortField)
  sort?: ClassifiedSortField = ClassifiedSortField.DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  category_field_filters?: string;
}
