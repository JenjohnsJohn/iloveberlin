import {
  IsArray,
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsIn,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../interfaces/category-field.interface';

class FieldValidationDto {
  @IsOptional()
  @IsInt()
  min?: number;

  @IsOptional()
  @IsInt()
  max?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  pattern?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;
}

class CategoryFieldDefinitionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  label!: string;

  @IsIn(['text', 'number', 'select', 'date', 'boolean', 'textarea', 'url'])
  type!: FieldType;

  @IsBoolean()
  required!: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  placeholder?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FieldValidationDto)
  validation?: FieldValidationDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  group!: string;

  @IsInt()
  @Min(0)
  sort_order!: number;

  @IsOptional()
  @IsBoolean()
  filterable?: boolean;

  @IsOptional()
  @IsBoolean()
  show_in_listing?: boolean;
}

export class UpdateCategorySchemaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryFieldDefinitionDto)
  schema!: CategoryFieldDefinitionDto[];
}
