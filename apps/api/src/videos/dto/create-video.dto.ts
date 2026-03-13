import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsUrl,
  IsArray,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { VideoProvider, VideoStatus } from '../entities/video.entity';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsUrl()
  @IsNotEmpty({ message: 'Video URL must not be empty' })
  @MaxLength(500)
  video_url!: string;

  @IsOptional()
  @IsEnum(VideoProvider)
  video_provider?: VideoProvider;

  @IsOptional()
  @IsUUID()
  thumbnail_id?: string;

  @IsOptional()
  @IsUUID()
  series_id?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_seconds?: number;

  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsDateString()
  published_at?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tag_ids?: string[];
}
