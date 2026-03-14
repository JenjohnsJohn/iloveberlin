import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CompetitionStatus } from '../entities/competition.entity';

export enum CompetitionSortField {
  DATE = 'date',
  TITLE = 'title',
  CREATED = 'created',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class CompetitionQueryDto {
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
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;

  @IsOptional()
  @IsEnum(CompetitionSortField)
  sort?: CompetitionSortField = CompetitionSortField.DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
