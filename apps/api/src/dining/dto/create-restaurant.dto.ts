import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsEmail,
  MaxLength,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { PriceRange, RestaurantStatus } from '../entities/restaurant.entity';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'Address must not be empty' })
  @MaxLength(500)
  address!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  google_place_id?: string;

  @IsOptional()
  @IsEnum(PriceRange)
  price_range?: PriceRange;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Rating must be between 0 and 5' })
  @Max(5, { message: 'Rating must be between 0 and 5' })
  rating?: number;

  @IsOptional()
  @IsObject()
  opening_hours?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  featured_image_id?: string;

  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  cuisine_ids?: string[];
}
