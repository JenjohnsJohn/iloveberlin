import { IsOptional, IsString, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus } from '../entities/article.entity';

export enum ArticleSortField {
  DATE = 'date',
  VIEWS = 'views',
  TRENDING = 'trending',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ArticleQueryDto {
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
  tag?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsUUID()
  author_id?: string;

  @IsOptional()
  @IsEnum(ArticleSortField)
  sort?: ArticleSortField = ArticleSortField.DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsString()
  search?: string;
}
