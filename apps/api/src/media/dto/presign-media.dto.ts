import { IsString, MaxLength } from 'class-validator';

export class PresignMediaDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(100)
  content_type!: string;
}
