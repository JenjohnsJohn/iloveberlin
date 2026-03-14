import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { Video, VideoStatus } from './entities/video.entity';
import { VideoSeries } from './entities/video-series.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Media } from '../media/entities/media.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoSeriesDto } from './dto/create-video-series.dto';
import { UpdateVideoSeriesDto } from './dto/update-video-series.dto';
import { VideoQueryDto, VideoSortField, SortOrder } from './dto/video-query.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoSeries)
    private readonly seriesRepository: Repository<VideoSeries>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // ── HTML Sanitization ─────────────────────────────────

  private sanitizeHtml(html: string): string {
    if (!html) return html;
    let sanitized = html;
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');
    sanitized = sanitized.replace(/srcdoc\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    sanitized = sanitized.replace(/<\/?(?:object|embed)\b[^>]*>/gi, '');
    return sanitized;
  }

  // ── FK Validation ─────────────────────────────────────

  private async validateThumbnail(thumbnailId: string | undefined | null): Promise<void> {
    if (!thumbnailId) return;
    const media = await this.mediaRepository.findOne({ where: { id: thumbnailId } });
    if (!media) {
      throw new BadRequestException(`Media with id "${thumbnailId}" not found`);
    }
  }

  private async validateSeries(seriesId: string | undefined | null): Promise<void> {
    if (!seriesId) return;
    const series = await this.seriesRepository.findOne({ where: { id: seriesId } });
    if (!series) {
      throw new BadRequestException(`Video series with id "${seriesId}" not found`);
    }
  }

  private async validateCategory(categoryId: string | undefined | null): Promise<void> {
    if (!categoryId) return;
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException(`Category with id "${categoryId}" not found`);
    }
  }

  // ─── Videos CRUD ───────────────────────────────────────────

  async createVideo(dto: CreateVideoDto): Promise<Video> {
    const slug = await this.generateUniqueVideoSlug(dto.title);

    // Validate FK references
    await this.validateThumbnail(dto.thumbnail_id);
    await this.validateSeries(dto.series_id);
    await this.validateCategory(dto.category_id);

    const video = this.videoRepository.create({
      title: this.sanitizeHtml(dto.title),
      slug,
      description: dto.description ? this.sanitizeHtml(dto.description) : null,
      video_url: dto.video_url,
      video_provider: dto.video_provider,
      thumbnail_id: dto.thumbnail_id || null,
      series_id: dto.series_id || null,
      category_id: dto.category_id || null,
      duration_seconds: dto.duration_seconds || null,
      status: dto.status || VideoStatus.DRAFT,
      published_at: dto.published_at ? new Date(dto.published_at) : null,
    });

    if (video.status === VideoStatus.PUBLISHED && !video.published_at) {
      video.published_at = new Date();
    }

    const savedVideo = await this.videoRepository.save(video);

    if (dto.tag_ids && dto.tag_ids.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(dto.tag_ids) });
      savedVideo.tags = tags;
      await this.videoRepository.save(savedVideo);
    }

    return this.findVideoById(savedVideo.id);
  }

  async findAllVideos(
    query: VideoQueryDto,
    isPublicOnly = true,
  ): Promise<{ data: Video[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.thumbnail', 'thumbnail')
      .leftJoinAndSelect('video.series', 'series')
      .leftJoinAndSelect('video.category', 'category')
      .leftJoinAndSelect('video.tags', 'tags');

    if (isPublicOnly) {
      qb.andWhere('video.status = :status', {
        status: VideoStatus.PUBLISHED,
      });
    } else if (query.status) {
      qb.andWhere('video.status = :status', { status: query.status });
    }

    if (query.series) {
      qb.andWhere('series.slug = :seriesSlug', {
        seriesSlug: query.series,
      });
    }

    if (query.category) {
      const categoryIds = await this.getCategoryAndDescendantIds(query.category);
      if (categoryIds.length > 0) {
        qb.andWhere('video.category_id IN (:...categoryIds)', { categoryIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    if (query.search) {
      qb.andWhere(
        '(video.title ILIKE :search OR video.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findVideoBySlug(slug: string, publicOnly = true): Promise<Video> {
    const qb = this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.thumbnail', 'thumbnail')
      .leftJoinAndSelect('video.series', 'series')
      .leftJoinAndSelect('video.category', 'category')
      .leftJoinAndSelect('video.tags', 'tags')
      .where('video.slug = :slug', { slug });

    if (publicOnly) {
      qb.andWhere('video.status = :status', { status: VideoStatus.PUBLISHED });
    }

    const video = await qb.getOne();

    if (!video) {
      throw new NotFoundException(`Video with slug "${slug}" not found`);
    }

    return video;
  }

  async findVideoById(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['thumbnail', 'series', 'category', 'tags'],
    });

    if (!video) {
      throw new NotFoundException(`Video with id "${id}" not found`);
    }

    return video;
  }

  async updateVideo(id: string, dto: UpdateVideoDto): Promise<Video> {
    const video = await this.findVideoById(id);

    // Validate FK references if provided
    if (dto.thumbnail_id !== undefined) {
      await this.validateThumbnail(dto.thumbnail_id);
    }
    if (dto.series_id !== undefined) {
      await this.validateSeries(dto.series_id);
    }
    if (dto.category_id !== undefined) {
      await this.validateCategory(dto.category_id);
    }

    if (dto.title !== undefined) video.title = this.sanitizeHtml(dto.title);
    if (dto.description !== undefined) video.description = dto.description ? this.sanitizeHtml(dto.description) : null;
    if (dto.video_url !== undefined) video.video_url = dto.video_url;
    if (dto.video_provider !== undefined) video.video_provider = dto.video_provider;
    if (dto.thumbnail_id !== undefined) video.thumbnail_id = dto.thumbnail_id || null;
    if (dto.series_id !== undefined) video.series_id = dto.series_id || null;
    if (dto.category_id !== undefined) video.category_id = dto.category_id || null;
    if (dto.duration_seconds !== undefined) video.duration_seconds = dto.duration_seconds || null;
    if (dto.status !== undefined) {
      video.status = dto.status;
      if (dto.status === VideoStatus.PUBLISHED && !video.published_at) {
        video.published_at = new Date();
      }
    }
    if (dto.published_at !== undefined) video.published_at = dto.published_at ? new Date(dto.published_at) : null;

    if (dto.tag_ids !== undefined) {
      if (dto.tag_ids.length > 0) {
        video.tags = await this.tagRepository.findBy({ id: In(dto.tag_ids) });
      } else {
        video.tags = [];
      }
    }

    await this.videoRepository.save(video);
    return this.findVideoById(video.id);
  }

  async deleteVideo(id: string): Promise<void> {
    const video = await this.findVideoById(id);
    await this.videoRepository.softRemove(video);
  }

  async incrementViewCount(slug: string): Promise<void> {
    await this.videoRepository
      .createQueryBuilder()
      .update(Video)
      .set({ view_count: () => '"view_count" + 1' })
      .where('slug = :slug', { slug })
      .andWhere('status = :status', { status: VideoStatus.PUBLISHED })
      .execute();
  }

  async findRelatedVideos(videoId: string, limit = 4): Promise<Video[]> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException(`Video with id "${videoId}" not found`);
    }

    const qb = this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.thumbnail', 'thumbnail')
      .leftJoinAndSelect('video.series', 'series')
      .leftJoinAndSelect('video.category', 'category')
      .leftJoinAndSelect('video.tags', 'tags')
      .where('video.id != :videoId', { videoId })
      .andWhere('video.status = :status', {
        status: VideoStatus.PUBLISHED,
      });

    if (video.series_id) {
      qb.andWhere('video.series_id = :seriesId', {
        seriesId: video.series_id,
      });
    }

    qb.orderBy('video.published_at', 'DESC').take(limit);

    return qb.getMany();
  }

  // ─── Series CRUD ───────────────────────────────────────────

  async createSeries(dto: CreateVideoSeriesDto): Promise<VideoSeries> {
    const slug = await this.generateUniqueSeriesSlug(dto.name);

    // Validate FK references
    await this.validateThumbnail(dto.thumbnail_id);

    const series = this.seriesRepository.create({
      name: this.sanitizeHtml(dto.name),
      slug,
      description: dto.description ? this.sanitizeHtml(dto.description) : null,
      thumbnail_id: dto.thumbnail_id || null,
      sort_order: dto.sort_order || 0,
    });

    return this.seriesRepository.save(series);
  }

  async findAllSeries(): Promise<VideoSeries[]> {
    return this.seriesRepository.find({
      order: { sort_order: 'ASC', name: 'ASC' },
      relations: ['thumbnail'],
    });
  }

  async findSeriesBySlug(slug: string): Promise<VideoSeries> {
    const series = await this.seriesRepository.findOne({
      where: { slug },
      relations: ['thumbnail'],
    });

    if (!series) {
      throw new NotFoundException(`Video series with slug "${slug}" not found`);
    }

    return series;
  }

  async findSeriesById(id: string): Promise<VideoSeries> {
    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: ['thumbnail'],
    });

    if (!series) {
      throw new NotFoundException(`Video series with id "${id}" not found`);
    }

    return series;
  }

  async updateSeries(id: string, dto: UpdateVideoSeriesDto): Promise<VideoSeries> {
    const series = await this.findSeriesById(id);

    // Validate FK references if provided
    if (dto.thumbnail_id !== undefined) {
      await this.validateThumbnail(dto.thumbnail_id);
    }

    if (dto.name !== undefined) series.name = this.sanitizeHtml(dto.name);
    if (dto.description !== undefined) series.description = dto.description ? this.sanitizeHtml(dto.description) : null;
    if (dto.thumbnail_id !== undefined) series.thumbnail_id = dto.thumbnail_id || null;
    if (dto.sort_order !== undefined) series.sort_order = dto.sort_order;

    return this.seriesRepository.save(series);
  }

  async deleteSeries(id: string): Promise<void> {
    const series = await this.findSeriesById(id);
    await this.seriesRepository.remove(series);
  }

  // ─── Private helpers ───────────────────────────────────────

  private async getCategoryAndDescendantIds(slug: string): Promise<string[]> {
    const cat = await this.categoryRepository.findOne({
      where: { slug, type: 'video', is_active: true },
    });
    if (!cat) return [];

    const children = await this.categoryRepository.find({
      where: { parent_id: cat.id, is_active: true },
    });

    const grandchildren =
      children.length > 0
        ? await this.categoryRepository.find({
            where: children.map((c) => ({
              parent_id: c.id,
              is_active: true,
            })),
          })
        : [];

    return [
      cat.id,
      ...children.map((c) => c.id),
      ...grandchildren.map((c) => c.id),
    ];
  }

  private applySorting(
    qb: SelectQueryBuilder<Video>,
    sort?: VideoSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.ASC ? 'ASC' : 'DESC';

    switch (sort) {
      case VideoSortField.TITLE:
        qb.orderBy('video.title', direction);
        break;
      case VideoSortField.VIEWS:
        qb.orderBy('video.view_count', direction);
        break;
      case VideoSortField.CREATED:
        qb.orderBy('video.created_at', direction);
        break;
      case VideoSortField.DATE:
      default:
        qb.orderBy('video.published_at', direction);
        break;
    }
  }

  private async generateUniqueVideoSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.videoRepository.findOne({
        where: { slug },
        withDeleted: true,
      });
      if (!existing) {
        return slug;
      }
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }
  }

  private async generateUniqueSeriesSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.seriesRepository.findOne({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }
  }
}
