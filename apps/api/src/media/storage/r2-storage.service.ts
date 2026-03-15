import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as path from 'path';
import { StorageService } from './storage.interface';

@Injectable()
export class R2StorageService implements StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly uploadBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = this.configService.getOrThrow<string>('R2_PUBLIC_URL');

    const port = this.configService.get<number>('PORT', 3001);
    const mediaBaseUrl = this.configService.get<string>(
      'MEDIA_BASE_URL',
      `http://localhost:${port}/uploads`,
    );
    this.uploadBaseUrl = mediaBaseUrl.replace('/uploads', '/api/media/upload');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:
          this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey:
          this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  getUploadUrl(storageKey: string): string {
    return `${this.uploadBaseUrl}/${storageKey}`;
  }

  getFileUrl(storageKey: string): string {
    return `${this.publicUrl}/${storageKey}`;
  }

  getThumbnailUrl(storageKey: string): string {
    const ext = path.extname(storageKey);
    const base = path.basename(storageKey, ext);
    return `${this.publicUrl}/thumbs/${base}_thumb${ext}`;
  }

  async saveFile(storageKey: string, data: Buffer): Promise<string> {
    const contentType = this.guessContentType(storageKey);
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        Body: data,
        ContentType: contentType,
      }),
    );
    return this.getFileUrl(storageKey);
  }

  async fileExists(storageKey: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );
    } catch {
      // Object may not exist
    }
  }

  async generateThumbnail(
    storageKey: string,
    width = 300,
    height = 300,
  ): Promise<string | null> {
    try {
      const sharp = await import('sharp');
      const data = await this.downloadToBuffer(storageKey);
      if (!data) return null;

      const thumbnailBuffer = await sharp
        .default(data)
        .resize(width, height, { fit: 'cover' })
        .toBuffer();

      const ext = path.extname(storageKey);
      const base = path.basename(storageKey, ext);
      const thumbKey = `thumbs/${base}_thumb${ext}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbKey,
          Body: thumbnailBuffer,
          ContentType: this.guessContentType(storageKey),
        }),
      );

      return this.getFileUrl(thumbKey);
    } catch (error) {
      this.logger.warn(
        `Failed to generate thumbnail for ${storageKey}: ${error}`,
      );
      return null;
    }
  }

  async getImageDimensions(
    storageKey: string,
  ): Promise<{ width: number; height: number } | null> {
    try {
      const sharp = await import('sharp');
      const data = await this.downloadToBuffer(storageKey);
      if (!data) return null;

      const metadata = await sharp.default(data).metadata();
      if (metadata.width && metadata.height) {
        return { width: metadata.width, height: metadata.height };
      }
      return null;
    } catch {
      return null;
    }
  }

  private async downloadToBuffer(
    storageKey: string,
  ): Promise<Buffer | null> {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );
      const stream = response.Body;
      if (!stream) return null;
      return Buffer.from(await stream.transformToByteArray());
    } catch {
      return null;
    }
  }

  private guessContentType(storageKey: string): string {
    const ext = path.extname(storageKey).toLowerCase();
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
  }
}
