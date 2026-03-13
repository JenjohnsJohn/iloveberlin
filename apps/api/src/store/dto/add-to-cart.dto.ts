import {
  IsUUID,
  IsOptional,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  product_id!: string;

  @IsOptional()
  @IsUUID()
  variant_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @IsOptional()
  @IsString()
  session_id?: string;
}
