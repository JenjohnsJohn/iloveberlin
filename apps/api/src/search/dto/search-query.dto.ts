import { IsOptional, IsString, IsEnum, IsInt, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchContentType {
  ARTICLES = 'articles',
  GUIDES = 'guides',
  EVENTS = 'events',
  RESTAURANTS = 'restaurants',
  VIDEOS = 'videos',
  CLASSIFIEDS = 'classifieds',
  PRODUCTS = 'products',
}

export class SearchQueryDto {
  @IsString()
  @MinLength(1)
  q!: string;

  @IsOptional()
  @IsEnum(SearchContentType)
  type?: SearchContentType;

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
}

export class SuggestQueryDto {
  @IsString()
  @MinLength(2)
  q!: string;
}
