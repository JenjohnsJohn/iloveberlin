import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  email_new_articles?: boolean;

  @IsOptional()
  @IsBoolean()
  email_events?: boolean;

  @IsOptional()
  @IsBoolean()
  email_competitions?: boolean;

  @IsOptional()
  @IsBoolean()
  email_newsletter?: boolean;

  @IsOptional()
  @IsBoolean()
  push_new_articles?: boolean;

  @IsOptional()
  @IsBoolean()
  push_events?: boolean;

  @IsOptional()
  @IsBoolean()
  push_competitions?: boolean;
}
