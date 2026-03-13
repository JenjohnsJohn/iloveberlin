import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';

export enum EventSortField {
  DATE = 'date',
  TITLE = 'title',
  CREATED = 'created',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum DateFilter {
  TODAY = 'today',
  WEEKEND = 'weekend',
  WEEK = 'week',
  MONTH = 'month',
}

export class EventQueryDto {
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
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  is_free?: boolean;

  @IsOptional()
  @IsEnum(EventSortField)
  sort?: EventSortField = EventSortField.DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @IsEnum(DateFilter)
  date_filter?: DateFilter;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
