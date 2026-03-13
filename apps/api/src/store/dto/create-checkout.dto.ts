import {
  IsString,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty({ message: 'Shipping name must not be empty' })
  @MaxLength(200)
  shipping_name!: string;

  @IsEmail()
  @MaxLength(255)
  shipping_email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Shipping address must not be empty' })
  @MaxLength(500)
  shipping_address!: string;

  @IsString()
  @IsNotEmpty({ message: 'Shipping city must not be empty' })
  @MaxLength(200)
  shipping_city!: string;

  @IsString()
  @IsNotEmpty({ message: 'Postal code must not be empty' })
  @MaxLength(20)
  shipping_postal_code!: string;

  @IsString()
  @IsNotEmpty({ message: 'Country must not be empty' })
  @MaxLength(100)
  shipping_country!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  discount_code?: string;

  @IsOptional()
  @IsString()
  session_id?: string;
}
