import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsUUID()
  venue_id?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsDateString()
  start_date!: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsBoolean()
  is_recurring?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rrule?: string;

  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price must be non-negative' })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price must be non-negative' })
  price_max?: number;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  ticket_url?: string;

  @IsOptional()
  @IsUUID()
  featured_image_id?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
