import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { CompetitionStatus } from '../entities/competition.entity';

export class UpdateCompetitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  prize_description?: string;

  @IsOptional()
  @IsUUID()
  featured_image_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsEnum(CompetitionStatus)
  status?: CompetitionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  terms_conditions?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_entries?: number;
}
