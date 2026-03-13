import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEndDateAfterStart', async: false })
class IsEndDateAfterStart implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const dto = args.object as CreateDiningOfferDto;
    if (!dto.start_date || !endDate) return true;
    return endDate >= dto.start_date;
  }
  defaultMessage() {
    return 'end_date must be on or after start_date';
  }
}

export class CreateDiningOfferDto {
  @IsUUID()
  restaurant_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  @Validate(IsEndDateAfterStart)
  end_date!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
