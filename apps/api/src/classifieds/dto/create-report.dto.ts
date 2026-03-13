import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ClassifiedReportReason } from '../entities/classified-report.entity';

export class CreateReportDto {
  @IsEnum(ClassifiedReportReason)
  reason!: ClassifiedReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
