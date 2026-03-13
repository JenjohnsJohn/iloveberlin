import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  MaxLength,
  Min,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { CompetitionStatus } from '../entities/competition.entity';

@ValidatorConstraint({ name: 'isEndDateAfterStart', async: false })
class IsEndDateAfterStart implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const dto = args.object as CreateCompetitionDto;
    if (!dto.start_date || !endDate) return true;
    return endDate >= dto.start_date;
  }
  defaultMessage() {
    return 'end_date must be on or after start_date';
  }
}

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description must not be empty' })
  @MaxLength(10000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  prize_description?: string;

  @IsOptional()
  @IsUUID()
  featured_image_id?: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  @Validate(IsEndDateAfterStart)
  end_date!: string;

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
