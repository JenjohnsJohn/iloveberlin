import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Guide, GuideStatus } from './entities/guide.entity';
import { GuideTopic } from './entities/guide-topic.entity';
import { Media } from '../media/entities/media.entity';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { generateSlug } from '../common/utils/slug.util';

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

@Injectable()
export class GuidesService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    @InjectRepository(GuideTopic)
    private readonly topicRepository: Repository<GuideTopic>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly dataSource: DataSource,
  ) {}

  private async getCountsByTopic(): Promise<Map<string, number>> {
    const rows: { topic_id: string; count: number }[] = await this.dataSource.query(
      `SELECT topic_id, COUNT(*)::int AS count
       FROM guides
       WHERE status = 'published' AND deleted_at IS NULL AND topic_id IS NOT NULL
       GROUP BY topic_id`,
    );
    return new Map(rows.map((r) => [r.topic_id, r.count]));
  }

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

  private async validateTopic(topicId: string | undefined | null): Promise<void> {
    if (!topicId) return;
    const topic = await this.topicRepository.findOne({ where: { id: topicId } });
    if (!topic) {
      throw new BadRequestException(`Guide topic with id "${topicId}" not found`);
    }
  }

  private async validateFeaturedImage(imageId: string | undefined | null): Promise<void> {
    if (!imageId) return;
    const media = await this.mediaRepository.findOne({ where: { id: imageId } });
    if (!media) {
      throw new BadRequestException(`Media with id "${imageId}" not found`);
    }
  }

  // ── Topics ──────────────────────────────────────────────

  async createTopic(dto: CreateTopicDto): Promise<GuideTopic> {
    const slug = await this.generateUniqueTopicSlug(dto.name);

    const topic = this.topicRepository.create({
      name: dto.name,
      slug,
      description: dto.description || null,
      icon: dto.icon || null,
      sort_order: dto.sort_order ?? 0,
    });

    return this.topicRepository.save(topic);
  }

  async findAllTopics(): Promise<GuideTopic[]> {
    return this.topicRepository.find({
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findTopicTree(): Promise<GuideTopic[]> {
    const roots = await this.topicRepository.find({
      where: { parent_id: IsNull() },
      relations: ['children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });

    const countsMap = await this.getCountsByTopic();
    for (const root of roots) {
      let childrenTotal = 0;
      if (root.children) {
        for (const child of root.children) {
          const count = countsMap.get(child.id) || 0;
          (child as any).listing_count = count;
          childrenTotal += count;
        }
      }
      const ownCount = countsMap.get(root.id) || 0;
      (root as any).listing_count = ownCount + childrenTotal;
    }

    return roots;
  }

  private async getTopicAndDescendantIds(slug: string): Promise<string[]> {
    const topic = await this.topicRepository.findOne({
      where: { slug },
    });
    if (!topic) return [];

    const children = await this.topicRepository.find({
      where: { parent_id: topic.id },
    });

    return [
      topic.id,
      ...children.map((c) => c.id),
    ];
  }

  async findTopicBySlug(slug: string): Promise<GuideTopic> {
    const topic = await this.topicRepository.findOne({
      where: { slug },
      relations: ['guides'],
    });

    if (!topic) {
      throw new NotFoundException(`Guide topic with slug "${slug}" not found`);
    }

    return topic;
  }

  async findTopicById(id: string): Promise<GuideTopic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException(`Guide topic with id "${id}" not found`);
    }

    return topic;
  }

  async updateTopic(id: string, dto: UpdateTopicDto): Promise<GuideTopic> {
    const topic = await this.findTopicById(id);

    if (dto.name !== undefined) topic.name = dto.name;
    if (dto.description !== undefined) topic.description = dto.description || null;
    if (dto.icon !== undefined) topic.icon = dto.icon || null;
    if (dto.sort_order !== undefined) topic.sort_order = dto.sort_order;

    await this.topicRepository.save(topic);
    return this.findTopicById(topic.id);
  }

  async deleteTopic(id: string): Promise<void> {
    const topic = await this.findTopicById(id);
    await this.topicRepository.remove(topic);
  }

  // ── Guides ──────────────────────────────────────────────

  async create(dto: CreateGuideDto, authorId: string): Promise<Guide> {
    const slug = await this.generateUniqueGuideSlug(dto.title);

    // Validate FK references
    await this.validateTopic(dto.topic_id);
    await this.validateFeaturedImage(dto.featured_image_id);

    const guide = this.guideRepository.create({
      title: dto.title,
      slug,
      body: this.sanitizeHtml(dto.body),
      excerpt: dto.excerpt || null,
      topic_id: dto.topic_id || null,
      featured_image_id: dto.featured_image_id || null,
      author_id: authorId,
      status: dto.status || GuideStatus.DRAFT,
      last_reviewed_at: dto.last_reviewed_at ? new Date(dto.last_reviewed_at) : null,
      seo_title: dto.seo_title || null,
      seo_description: dto.seo_description || null,
    });

    if (guide.status === GuideStatus.PUBLISHED) {
      guide.published_at = new Date();
    }

    const savedGuide = await this.guideRepository.save(guide);
    return this.findById(savedGuide.id);
  }

  async findAll(
    isPublicOnly = true,
    page = 1,
    limit = 20,
    topicSlug?: string,
    status?: string,
  ): Promise<{ data: Guide[]; total: number; page: number; limit: number }> {
    const qb = this.guideRepository
      .createQueryBuilder('guide')
      .leftJoinAndSelect('guide.topic', 'topic')
      .leftJoinAndSelect('guide.featured_image', 'featured_image');

    if (isPublicOnly) {
      qb.leftJoin('guide.author', 'author')
        .addSelect(['author.id', 'author.display_name', 'author.avatar_url'])
        .andWhere('guide.status = :publishedStatus', { publishedStatus: GuideStatus.PUBLISHED });
    } else {
      qb.leftJoinAndSelect('guide.author', 'author');
      if (status) {
        qb.andWhere('guide.status = :status', { status });
      }
    }

    if (topicSlug) {
      const topicIds = await this.getTopicAndDescendantIds(topicSlug);
      if (topicIds.length > 0) {
        qb.andWhere('guide.topic_id IN (:...topicIds)', { topicIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    qb.orderBy('guide.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findBySlug(slug: string, publicOnly = true): Promise<Guide> {
    const qb = this.guideRepository
      .createQueryBuilder('guide')
      .leftJoinAndSelect('guide.topic', 'topic')
      .leftJoinAndSelect('guide.featured_image', 'featured_image')
      .where('guide.slug = :slug', { slug });

    if (publicOnly) {
      qb.leftJoin('guide.author', 'author')
        .addSelect(['author.id', 'author.display_name', 'author.avatar_url', 'author.bio'])
        .andWhere('guide.status = :status', { status: GuideStatus.PUBLISHED });
    } else {
      qb.leftJoinAndSelect('guide.author', 'author');
    }

    const guide = await qb.getOne();

    if (!guide) {
      throw new NotFoundException(`Guide with slug "${slug}" not found`);
    }

    return guide;
  }

  async findById(id: string): Promise<Guide> {
    const guide = await this.guideRepository.findOne({
      where: { id },
      relations: ['topic', 'author', 'featured_image'],
    });

    if (!guide) {
      throw new NotFoundException(`Guide with id "${id}" not found`);
    }

    return guide;
  }

  async findByTopic(topicSlug: string): Promise<Guide[]> {
    const topicIds = await this.getTopicAndDescendantIds(topicSlug);
    if (topicIds.length === 0) return [];

    return this.guideRepository
      .createQueryBuilder('guide')
      .leftJoinAndSelect('guide.topic', 'topic')
      .leftJoin('guide.author', 'author')
      .addSelect(['author.id', 'author.display_name', 'author.avatar_url'])
      .leftJoinAndSelect('guide.featured_image', 'featured_image')
      .where('guide.topic_id IN (:...topicIds)', { topicIds })
      .andWhere('guide.status = :status', { status: GuideStatus.PUBLISHED })
      .orderBy('guide.created_at', 'DESC')
      .getMany();
  }

  async update(
    id: string,
    dto: UpdateGuideDto,
    userId: string,
    userRole: string,
  ): Promise<Guide> {
    const guide = await this.findById(id);

    // Ownership check: only author or admin+ can update
    if (
      guide.author_id !== userId &&
      userRole !== 'admin' &&
      userRole !== 'super_admin'
    ) {
      throw new ForbiddenException('You can only update your own guides');
    }

    // Validate FK references if provided
    if (dto.topic_id !== undefined) {
      await this.validateTopic(dto.topic_id);
    }
    if (dto.featured_image_id !== undefined) {
      await this.validateFeaturedImage(dto.featured_image_id);
    }

    if (dto.title !== undefined) guide.title = dto.title;
    if (dto.body !== undefined) guide.body = this.sanitizeHtml(dto.body);
    if (dto.excerpt !== undefined) guide.excerpt = dto.excerpt || null;
    if (dto.topic_id !== undefined) guide.topic_id = dto.topic_id || null;
    if (dto.featured_image_id !== undefined) guide.featured_image_id = dto.featured_image_id || null;
    if (dto.status !== undefined) {
      guide.status = dto.status;
      if (dto.status === GuideStatus.PUBLISHED && !guide.published_at) {
        guide.published_at = new Date();
      }
    }
    if (dto.last_reviewed_at !== undefined) {
      guide.last_reviewed_at = dto.last_reviewed_at ? new Date(dto.last_reviewed_at) : null;
    }
    if (dto.seo_title !== undefined) guide.seo_title = dto.seo_title || null;
    if (dto.seo_description !== undefined) guide.seo_description = dto.seo_description || null;

    await this.guideRepository.save(guide);
    return this.findById(guide.id);
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const guide = await this.findById(id);

    // Ownership check: only author or admin+ can delete
    if (
      guide.author_id !== userId &&
      userRole !== 'admin' &&
      userRole !== 'super_admin'
    ) {
      throw new ForbiddenException('You can only delete your own guides');
    }

    await this.guideRepository.softRemove(guide);
  }

  /**
   * Auto-generate a Table of Contents from H2/H3 headings in the body.
   */
  generateTableOfContents(body: string): TocEntry[] {
    const headingRegex = /<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
    const toc: TocEntry[] = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(body)) !== null) {
      const level = parseInt(match[1], 10);
      const existingId = match[2];
      const text = match[3].replace(/<[^>]+>/g, '').trim();
      const id = existingId || generateSlug(text);

      toc.push({ id, text, level });
    }

    return toc;
  }

  // ── Private helpers ─────────────────────────────────────

  private async generateUniqueGuideSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.guideRepository.findOne({
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

  private async generateUniqueTopicSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.topicRepository.findOne({
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
