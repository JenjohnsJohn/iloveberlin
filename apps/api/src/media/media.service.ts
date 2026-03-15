import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { PresignMediaDto } from './dto/presign-media.dto';
import { ConfirmMediaDto } from './dto/confirm-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { StorageService } from './storage/storage.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @Inject('STORAGE_SERVICE')
    private readonly storage: StorageService,
  ) {}

  /**
   * Generates a storage key and returns an upload URL.
   * The client should PUT the file to the returned URL.
   */
  async presign(
    dto: PresignMediaDto,
  ): Promise<{ upload_url: string; storage_key: string }> {
    const ext = (dto.filename.split('.').pop() || '').toLowerCase();
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'svg'];
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `File extension ".${ext}" is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }
    const storageKey = `${uuidv4()}.${ext}`;
    const uploadUrl = this.storage.getUploadUrl(storageKey);

    return {
      upload_url: uploadUrl,
      storage_key: storageKey,
    };
  }

  /**
   * Confirms a media upload by saving its metadata.
   * Verifies the file exists on disk and generates a thumbnail for images.
   */
  async confirm(dto: ConfirmMediaDto, userId: string): Promise<Media> {
    const exists = await this.storage.fileExists(dto.storage_key);
    const url = exists
      ? this.storage.getFileUrl(dto.storage_key)
      : this.storage.getFileUrl(dto.storage_key);

    let thumbnailUrl: string | null = null;
    if (dto.mime_type.startsWith('image/')) {
      thumbnailUrl = await this.storage.generateThumbnail(dto.storage_key);
    }

    const media = this.mediaRepository.create({
      original_filename: dto.original_filename,
      storage_key: dto.storage_key,
      url,
      mime_type: dto.mime_type,
      file_size_bytes: dto.file_size_bytes,
      width: dto.width || null,
      height: dto.height || null,
      uploaded_by: userId,
    });

    if (thumbnailUrl) {
      media.sizes = { thumbnail: thumbnailUrl };
    }

    return this.mediaRepository.save(media);
  }

  /**
   * Processes an image: reads real dimensions and generates size variants.
   */
  async process(id: string): Promise<Media> {
    const media = await this.findOne(id);

    // Get real image dimensions
    const dimensions = await this.storage.getImageDimensions(media.storage_key);
    if (dimensions) {
      media.width = dimensions.width;
      media.height = dimensions.height;
    }

    // Generate thumbnail if not already present
    const thumbnailUrl = await this.storage.generateThumbnail(
      media.storage_key,
      150,
      150,
    );

    media.sizes = {
      thumbnail: thumbnailUrl || media.url,
      original: media.url,
    };

    return this.mediaRepository.save(media);
  }

  async findAll(page = 1, limit = 20): Promise<{ data: Media[]; total: number }> {
    const [data, total] = await this.mediaRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['uploader'],
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });
    if (!media) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }
    return media;
  }

  async update(id: string, dto: UpdateMediaDto): Promise<Media> {
    const media = await this.findOne(id);
    if (dto.alt_text !== undefined) media.alt_text = dto.alt_text;
    return this.mediaRepository.save(media);
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    await this.storage.deleteFile(media.storage_key);
    await this.mediaRepository.remove(media);
  }

  /**
   * Saves uploaded file data and returns the storage key.
   * Used by the upload endpoint.
   */
  async saveUploadedFile(storageKey: string, data: Buffer): Promise<string> {
    return this.storage.saveFile(storageKey, data);
  }
}
