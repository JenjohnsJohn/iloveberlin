import { IsOptional, IsObject } from 'class-validator';

export class EnterCompetitionDto {
  @IsOptional()
  @IsObject()
  entry_data?: Record<string, unknown>;
}
