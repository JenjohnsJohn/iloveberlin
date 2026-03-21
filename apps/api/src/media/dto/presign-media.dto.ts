import { IsString, IsIn, MaxLength } from 'class-validator';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
] as const;

export class PresignMediaDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(100)
  @IsIn(ALLOWED_MIME_TYPES, {
    message: `content_type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
  })
  content_type!: string;
}
