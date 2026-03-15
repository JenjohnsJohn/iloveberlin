import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageService } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService, OnModuleInit {
  private uploadDir: string;
  private mediaBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>(
      'UPLOAD_DIR',
      path.join(process.cwd(), 'uploads'),
    );
    const port = this.configService.get<number>('PORT', 3001);
    this.mediaBaseUrl = this.configService.get<string>(
      'MEDIA_BASE_URL',
      `http://localhost:${port}/uploads`,
    );
  }

  async onModuleInit() {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(path.join(this.uploadDir, 'thumbs'), { recursive: true });
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  getMediaBaseUrl(): string {
    return this.mediaBaseUrl;
  }

  /**
   * Returns the API upload endpoint URL for a given storage key.
   */
  getUploadUrl(storageKey: string): string {
    return `${this.mediaBaseUrl.replace('/uploads', '/api/media/upload')}/${storageKey}`;
  }

  /**
   * Returns the public URL for a stored file.
   */
  getFileUrl(storageKey: string): string {
    return `${this.mediaBaseUrl}/${storageKey}`;
  }

  /**
   * Returns the public URL for a thumbnail.
   */
  getThumbnailUrl(storageKey: string): string {
    const ext = path.extname(storageKey);
    const base = path.basename(storageKey, ext);
    return `${this.mediaBaseUrl}/thumbs/${base}_thumb${ext}`;
  }

  /**
   * Saves raw file data to the upload directory.
   */
  async saveFile(storageKey: string, data: Buffer): Promise<string> {
    const filePath = path.join(this.uploadDir, storageKey);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return this.getFileUrl(storageKey);
  }

  /**
   * Checks if a file exists in the upload directory.
   */
  async fileExists(storageKey: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.uploadDir, storageKey));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a file from the upload directory.
   */
  async deleteFile(storageKey: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.uploadDir, storageKey));
    } catch {
      // File may not exist
    }
  }

  /**
   * Generates a thumbnail for an image using sharp (if available).
   * Falls back gracefully if sharp is not installed.
   */
  async generateThumbnail(
    storageKey: string,
    width = 300,
    height = 300,
  ): Promise<string | null> {
    try {
      const sharp = await import('sharp');
      const inputPath = path.join(this.uploadDir, storageKey);
      const ext = path.extname(storageKey);
      const base = path.basename(storageKey, ext);
      const thumbKey = `thumbs/${base}_thumb${ext}`;
      const outputPath = path.join(this.uploadDir, thumbKey);

      await sharp
        .default(inputPath)
        .resize(width, height, { fit: 'cover' })
        .toFile(outputPath);

      return this.getFileUrl(thumbKey);
    } catch {
      // sharp not available or file not an image
      return null;
    }
  }

  /**
   * Gets image dimensions using sharp (if available).
   */
  async getImageDimensions(
    storageKey: string,
  ): Promise<{ width: number; height: number } | null> {
    try {
      const sharp = await import('sharp');
      const inputPath = path.join(this.uploadDir, storageKey);
      const metadata = await sharp.default(inputPath).metadata();
      if (metadata.width && metadata.height) {
        return { width: metadata.width, height: metadata.height };
      }
      return null;
    } catch {
      return null;
    }
  }
}
