import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In, DataSource } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';
import { ArticleRevision } from './entities/article-revision.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleQueryDto, ArticleSortField, SortOrder } from './dto/article-query.dto';
import { generateSlug } from '../common/utils/slug.util';
import { sanitize } from '../common/utils/sanitize.util';

@Injectable()
export class ArticlesService {
  private readonly recentViews = new Map<string, number>();

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleRevision)
    private readonly revisionRepository: Repository<ArticleRevision>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateArticleDto, authorId: string): Promise<Article> {
    // Validate category exists
    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.category_id } });
      if (!category) {
        throw new BadRequestException(`Category with id "${dto.category_id}" not found`);
      }
    }

    const slug = await this.generateUniqueSlug(dto.title);
    const sanitizedBody = this.sanitizeBody(dto.body);
    const readTime = this.calculateReadTime(sanitizedBody);

    // Wrap in transaction to ensure article + tags + revision are atomic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const article = this.articleRepository.create({
        title: dto.title,
        subtitle: dto.subtitle,
        slug,
        body: sanitizedBody,
        excerpt: dto.excerpt,
        featured_image_id: dto.featured_image_id,
        category_id: dto.category_id,
        author_id: authorId,
        status: dto.status || ArticleStatus.DRAFT,
        scheduled_at: dto.scheduled_at ? new Date(dto.scheduled_at) : null,
        read_time_minutes: readTime,
        seo_title: dto.seo_title,
        seo_description: dto.seo_description,
        seo_keywords: dto.seo_keywords,
      });

      if (article.status === ArticleStatus.PUBLISHED) {
        article.published_at = new Date();
      }

      const savedArticle = await queryRunner.manager.save(article);

      // Attach tags
      if (dto.tag_ids && dto.tag_ids.length > 0) {
        const tags = await this.tagRepository.findBy({ id: In(dto.tag_ids) });
        savedArticle.tags = tags;
        await queryRunner.manager.save(savedArticle);
      }

      // Save initial revision
      const revision = this.revisionRepository.create({
        article_id: savedArticle.id,
        title: dto.title,
        body: dto.body,
        edited_by: authorId,
      });
      await queryRunner.manager.save(revision);

      await queryRunner.commitTransaction();
      return this.findById(savedArticle.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    query: ArticleQueryDto,
    isPublicOnly = true,
  ): Promise<{ data: Article[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.featured_image', 'featured_image');

    if (isPublicOnly) {
      // Public: only select safe author fields
      qb.leftJoin('article.author', 'author')
        .addSelect(['author.id', 'author.display_name', 'author.avatar_url', 'author.bio']);
    } else {
      qb.leftJoinAndSelect('article.author', 'author');
    }

    if (isPublicOnly) {
      qb.andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });
    } else if (query.status) {
      qb.andWhere('article.status = :status', { status: query.status });
    }

    if (query.category) {
      const categoryIds = await this.getCategoryAndDescendantIds(query.category);
      if (categoryIds.length > 0) {
        qb.andWhere('article.category_id IN (:...categoryIds)', { categoryIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    if (query.tag) {
      qb.andWhere('tags.slug = :tagSlug', { tagSlug: query.tag });
    }

    if (query.author_id) {
      qb.andWhere('article.author_id = :authorId', { authorId: query.author_id });
    }

    if (query.search) {
      qb.andWhere(
        '(article.title ILIKE :search OR article.body ILIKE :search OR article.excerpt ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findBySlug(slug: string, publicOnly = true): Promise<Article> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoin('article.author', 'author')
      .addSelect(['author.id', 'author.display_name', 'author.avatar_url', 'author.bio'])
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.featured_image', 'featured_image')
      .leftJoinAndSelect('article.revisions', 'revisions')
      .where('article.slug = :slug', { slug });

    if (publicOnly) {
      qb.andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });
    }

    const article = await qb.getOne();

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    return article;
  }

  async findById(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'author', 'tags', 'featured_image'],
    });

    if (!article) {
      throw new NotFoundException(`Article with id "${id}" not found`);
    }

    return article;
  }

  async update(id: string, dto: UpdateArticleDto, userId: string): Promise<Article> {
    const article = await this.findById(id);

    if (dto.title !== undefined) article.title = dto.title;
    if (dto.subtitle !== undefined) article.subtitle = dto.subtitle || null;
    if (dto.body !== undefined) {
      article.body = this.sanitizeBody(dto.body);
      article.read_time_minutes = this.calculateReadTime(article.body);
    }
    if (dto.excerpt !== undefined) article.excerpt = dto.excerpt || null;
    if (dto.featured_image_id !== undefined) article.featured_image_id = dto.featured_image_id || null;
    if (dto.category_id !== undefined) article.category_id = dto.category_id || null;
    if (dto.seo_title !== undefined) article.seo_title = dto.seo_title || null;
    if (dto.seo_description !== undefined) article.seo_description = dto.seo_description || null;
    if (dto.seo_keywords !== undefined) article.seo_keywords = dto.seo_keywords || null;
    if (dto.scheduled_at !== undefined) article.scheduled_at = dto.scheduled_at ? new Date(dto.scheduled_at) : null;

    // Sync tags
    if (dto.tag_ids !== undefined) {
      if (dto.tag_ids.length > 0) {
        article.tags = await this.tagRepository.findBy({ id: In(dto.tag_ids) });
      } else {
        article.tags = [];
      }
    }

    await this.articleRepository.save(article);

    // Save revision
    await this.saveRevision(
      article.id,
      article.title,
      article.body,
      userId,
    );

    return this.findById(article.id);
  }

  async updateStatus(id: string, newStatus: ArticleStatus): Promise<Article> {
    const article = await this.findById(id);

    this.validateStatusTransition(article.status, newStatus);

    article.status = newStatus;

    if (newStatus === ArticleStatus.PUBLISHED && !article.published_at) {
      article.published_at = new Date();
    }

    await this.articleRepository.save(article);
    return this.findById(article.id);
  }

  async incrementViewCount(id: string, clientIp?: string): Promise<void> {
    // Deduplicate: max 1 view per IP per article per 5 minutes
    if (clientIp) {
      const key = `${id}:${clientIp}`;
      const lastView = this.recentViews.get(key);
      const now = Date.now();
      if (lastView && now - lastView < 5 * 60 * 1000) {
        return; // Skip duplicate view
      }
      this.recentViews.set(key, now);
      // Clean old entries periodically (keep map from growing unbounded)
      if (this.recentViews.size > 10000) {
        const cutoff = now - 5 * 60 * 1000;
        for (const [k, v] of this.recentViews) {
          if (v < cutoff) this.recentViews.delete(k);
        }
      }
    }
    await this.articleRepository.increment({ id }, 'view_count', 1);
  }

  async delete(id: string): Promise<void> {
    const article = await this.findById(id);
    await this.articleRepository.softRemove(article);
  }

  async findRelated(articleId: string, limit = 5): Promise<Article[]> {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['tags'],
    });

    if (!article) {
      throw new NotFoundException(`Article with id "${articleId}" not found`);
    }

    const tagIds = article.tags.map((t) => t.id);

    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.featured_image', 'featured_image')
      .where('article.id != :articleId', { articleId })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });

    if (article.category_id && tagIds.length > 0) {
      qb.andWhere(
        '(article.category_id = :categoryId OR tags.id IN (:...tagIds))',
        { categoryId: article.category_id, tagIds },
      );
    } else if (article.category_id) {
      qb.andWhere('article.category_id = :categoryId', {
        categoryId: article.category_id,
      });
    } else if (tagIds.length > 0) {
      qb.andWhere('tags.id IN (:...tagIds)', { tagIds });
    }

    qb.orderBy('article.published_at', 'DESC').take(limit);

    return qb.getMany();
  }

  async getRevisions(articleId: string): Promise<ArticleRevision[]> {
    await this.findById(articleId); // ensure article exists

    return this.revisionRepository.find({
      where: { article_id: articleId },
      relations: ['editor'],
      order: { created_at: 'DESC' },
    });
  }

  calculateReadTime(body: string): number {
    const wordCount = body.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return Math.max(1, minutes);
  }

  private sanitizeBody(body: string): string {
    return sanitize(body);
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.articleRepository.findOne({
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

  private async saveRevision(
    articleId: string,
    title: string,
    body: string,
    editedBy: string,
  ): Promise<ArticleRevision> {
    const revision = this.revisionRepository.create({
      article_id: articleId,
      title,
      body,
      edited_by: editedBy,
    });
    return this.revisionRepository.save(revision);
  }

  private validateStatusTransition(
    currentStatus: ArticleStatus,
    newStatus: ArticleStatus,
  ): void {
    const allowedTransitions: Record<ArticleStatus, ArticleStatus[]> = {
      [ArticleStatus.DRAFT]: [ArticleStatus.IN_REVIEW],
      [ArticleStatus.IN_REVIEW]: [ArticleStatus.DRAFT, ArticleStatus.SCHEDULED, ArticleStatus.PUBLISHED],
      [ArticleStatus.SCHEDULED]: [ArticleStatus.DRAFT, ArticleStatus.PUBLISHED],
      [ArticleStatus.PUBLISHED]: [ArticleStatus.ARCHIVED],
      [ArticleStatus.ARCHIVED]: [ArticleStatus.DRAFT],
    };

    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${newStatus}"`,
      );
    }
  }

  private async getCategoryAndDescendantIds(slug: string): Promise<string[]> {
    const cat = await this.categoryRepository.findOne({
      where: { slug, is_active: true },
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
    qb: SelectQueryBuilder<Article>,
    sort?: ArticleSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.ASC ? 'ASC' : 'DESC';

    switch (sort) {
      case ArticleSortField.VIEWS:
        qb.orderBy('article.view_count', direction);
        break;
      case ArticleSortField.TRENDING:
        // Trending: high views in recent articles
        qb.orderBy('article.view_count', 'DESC');
        qb.addOrderBy('article.published_at', 'DESC');
        break;
      case ArticleSortField.DATE:
      default:
        qb.orderBy('article.created_at', direction);
        break;
    }
  }
}
