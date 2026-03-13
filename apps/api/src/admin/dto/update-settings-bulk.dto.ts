import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class SettingUpdateItem {
  @IsString()
  key!: string;

  @IsOptional()
  @IsString()
  value!: string | null;
}

export class UpdateSettingsBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingUpdateItem)
  settings!: SettingUpdateItem[];
}
