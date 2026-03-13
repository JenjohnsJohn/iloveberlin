import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { GuideStatus } from '../entities/guide.entity';

export class CreateGuideDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Body must not be empty' })
  @MaxLength(100000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  excerpt?: string;

  @IsOptional()
  @IsUUID()
  topic_id?: string;

  @IsOptional()
  @IsUUID()
  featured_image_id?: string;

  @IsOptional()
  @IsEnum(GuideStatus)
  status?: GuideStatus;

  @IsOptional()
  @IsDateString()
  last_reviewed_at?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  seo_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seo_description?: string;
}
