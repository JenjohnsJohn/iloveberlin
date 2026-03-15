import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, LessThan, IsNull, DataSource } from 'typeorm';
import { Classified, ClassifiedStatus } from './entities/classified.entity';
import { ClassifiedCategory } from './entities/classified-category.entity';
import { ClassifiedImage } from './entities/classified-image.entity';
import { ClassifiedMessage } from './entities/classified-message.entity';
import { ClassifiedReport } from './entities/classified-report.entity';
import { ClassifiedReportStatus } from './entities/classified-report.entity';
import { CreateClassifiedDto } from './dto/create-classified.dto';
import { UpdateClassifiedDto } from './dto/update-classified.dto';
import { CreateClassifiedCategoryDto } from './dto/create-classified-category.dto';
import { UpdateClassifiedCategoryDto } from './dto/update-classified-category.dto';
import {
  ClassifiedQueryDto,
  ClassifiedSortField,
  SortOrder,
} from './dto/classified-query.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { CategoryFieldDefinition } from './interfaces/category-field.interface';
import { validateCategoryFields } from './validators/category-fields.validator';
import { generateSlug } from '../common/utils/slug.util';
import { sanitize } from '../common/utils/sanitize.util';

@Injectable()
export class ClassifiedsService {
  constructor(
    @InjectRepository(Classified)
    private readonly classifiedRepository: Repository<Classified>,
    @InjectRepository(ClassifiedCategory)
    private readonly categoryRepository: Repository<ClassifiedCategory>,
    @InjectRepository(ClassifiedImage)
    private readonly imageRepository: Repository<ClassifiedImage>,
    @InjectRepository(ClassifiedMessage)
    private readonly messageRepository: Repository<ClassifiedMessage>,
    @InjectRepository(ClassifiedReport)
    private readonly reportRepository: Repository<ClassifiedReport>,
    private readonly dataSource: DataSource,
  ) {}

  private async getCountsByClassifiedCategory(): Promise<Map<string, number>> {
    const rows: { category_id: string; count: number }[] = await this.dataSource.query(
      `SELECT category_id, COUNT(*)::int AS count
       FROM classifieds
       WHERE status = 'active' AND deleted_at IS NULL AND category_id IS NOT NULL
       GROUP BY category_id`,
    );
    return new Map(rows.map((r) => [r.category_id, r.count]));
  }

  // ─── Sanitization ───────────────────────────────────────

  private sanitizeHtml(input: string): string {
    return sanitize(input);
  }

  // ─── FK Validation ──────────────────────────────────────

  private async validateCategory(categoryId: string): Promise<ClassifiedCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, is_active: true },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with id "${categoryId}" not found`,
      );
    }
    return category;
  }

  // ─── Classifieds CRUD ──────────────────────────────────

  async create(
    userId: string,
    dto: CreateClassifiedDto,
  ): Promise<Classified> {
    const category = await this.validateCategory(dto.category_id);

    const slug = await this.generateUniqueSlug(dto.title);

    // Validate and sanitize category-specific fields
    let categoryFields: Record<string, unknown> = {};
    const effectiveSchema = await this.getEffectiveFieldSchema(category);
    if (dto.category_fields && effectiveSchema.length > 0) {
      const result = validateCategoryFields(effectiveSchema, dto.category_fields);
      if (!result.valid) {
        const messages = Object.values(result.errors).join('; ');
        throw new BadRequestException(`Category field validation failed: ${messages}`);
      }
      categoryFields = result.sanitized;
    }

    const classified = this.classifiedRepository.create({
      user_id: userId,
      category_id: dto.category_id,
      title: this.sanitizeHtml(dto.title),
      slug,
      description: this.sanitizeHtml(dto.description),
      price: dto.price !== undefined ? dto.price : null,
      price_type: dto.price_type || undefined,
      condition: dto.condition || null,
      location: dto.location ? this.sanitizeHtml(dto.location) : null,
      district: dto.district ? this.sanitizeHtml(dto.district) : null,
      category_fields: categoryFields,
      status: ClassifiedStatus.DRAFT,
    });

    const saved = await this.classifiedRepository.save(classified);
    return this.findById(saved.id);
  }

  async findAll(
    query: ClassifiedQueryDto,
  ): Promise<{
    data: Classified[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.classifiedRepository
      .createQueryBuilder('classified')
      .leftJoinAndSelect('classified.category', 'category')
      .leftJoinAndSelect('classified.images', 'images')
      .leftJoin('classified.user', 'user')
      .addSelect(['user.id', 'user.display_name']);

    // Default to only active listings for public view
    if (!query.status) {
      qb.andWhere('classified.status = :status', {
        status: ClassifiedStatus.ACTIVE,
      });
    } else {
      qb.andWhere('classified.status = :status', { status: query.status });
    }

    // Category filter (by slug — includes descendant categories)
    if (query.category) {
      const categoryIds = await this.getCategoryAndDescendantIds(query.category);
      if (categoryIds.length > 0) {
        qb.andWhere('classified.category_id IN (:...categoryIds)', { categoryIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    // District filter
    if (query.district) {
      qb.andWhere('classified.district = :district', {
        district: query.district,
      });
    }

    // Condition filter
    if (query.condition) {
      qb.andWhere('classified.condition = :condition', {
        condition: query.condition,
      });
    }

    // Price range filter
    if (query.price_min !== undefined) {
      qb.andWhere('classified.price >= :priceMin', {
        priceMin: query.price_min,
      });
    }
    if (query.price_max !== undefined) {
      qb.andWhere('classified.price <= :priceMax', {
        priceMax: query.price_max,
      });
    }

    // Search
    if (query.search) {
      qb.andWhere(
        '(classified.title ILIKE :search OR classified.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Category field filters (JSONB)
    if (query.category_field_filters) {
      try {
        const filters = JSON.parse(query.category_field_filters) as Record<string, string>;
        let filterIdx = 0;
        for (const [key, val] of Object.entries(filters)) {
          if (typeof key === 'string' && val !== undefined && val !== '') {
            const paramKey = `cf_${filterIdx}`;
            const paramVal = `cf_val_${filterIdx}`;
            qb.andWhere(`classified.category_fields->>:${paramKey} = :${paramVal}`, {
              [paramKey]: key,
              [paramVal]: String(val),
            });
            filterIdx++;
          }
        }
      } catch {
        // Invalid JSON — ignore filter
      }
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findBySlug(slug: string, publicOnly = true): Promise<Classified> {
    const qb = this.classifiedRepository
      .createQueryBuilder('classified')
      .leftJoinAndSelect('classified.category', 'category')
      .leftJoinAndSelect('classified.images', 'images')
      .leftJoin('classified.user', 'user')
      .addSelect(['user.id', 'user.display_name'])
      .where('classified.slug = :slug', { slug });

    if (publicOnly) {
      qb.andWhere('classified.status = :status', {
        status: ClassifiedStatus.ACTIVE,
      });
    }

    const classified = await qb.getOne();

    if (!classified) {
      throw new NotFoundException(
        `Classified with slug "${slug}" not found`,
      );
    }

    // Increment view count only for active listings
    if (classified.status === ClassifiedStatus.ACTIVE) {
      await this.classifiedRepository.increment(
        { id: classified.id },
        'view_count',
        1,
      );
    }

    return classified;
  }

  async findById(id: string): Promise<Classified> {
    const classified = await this.classifiedRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'user'],
    });

    if (!classified) {
      throw new NotFoundException(
        `Classified with id "${id}" not found`,
      );
    }

    return classified;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateClassifiedDto,
    userRole?: string,
  ): Promise<Classified> {
    const classified = await this.findById(id);

    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    if (classified.user_id !== userId && !isAdmin) {
      throw new ForbiddenException('You can only edit your own listings');
    }

    let category: ClassifiedCategory | undefined;
    if (dto.category_id !== undefined) {
      category = await this.validateCategory(dto.category_id);
      classified.category_id = dto.category_id;
    }
    if (dto.title !== undefined)
      classified.title = this.sanitizeHtml(dto.title);
    if (dto.description !== undefined)
      classified.description = this.sanitizeHtml(dto.description);
    if (dto.price !== undefined) classified.price = dto.price;
    if (dto.price_type !== undefined) classified.price_type = dto.price_type;
    if (dto.condition !== undefined) classified.condition = dto.condition;
    if (dto.location !== undefined)
      classified.location = dto.location ? this.sanitizeHtml(dto.location) : null;
    if (dto.district !== undefined)
      classified.district = dto.district ? this.sanitizeHtml(dto.district) : null;

    // Validate and merge category_fields
    if (dto.category_fields !== undefined) {
      if (!category) {
        category = await this.categoryRepository.findOne({
          where: { id: classified.category_id },
        }) || undefined;
      }
      const effectiveSchema = category ? await this.getEffectiveFieldSchema(category) : [];
      if (effectiveSchema.length > 0) {
        const merged = { ...(classified.category_fields || {}), ...dto.category_fields };
        const result = validateCategoryFields(effectiveSchema, merged);
        if (!result.valid) {
          const messages = Object.values(result.errors).join('; ');
          throw new BadRequestException(`Category field validation failed: ${messages}`);
        }
        classified.category_fields = result.sanitized;
      } else {
        classified.category_fields = dto.category_fields;
      }
    }

    await this.classifiedRepository.save(classified);
    return this.findById(classified.id);
  }

  async delete(id: string, userId: string, userRole?: string): Promise<void> {
    const classified = await this.findById(id);

    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    if (classified.user_id !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.classifiedRepository.softRemove(classified);
  }

  // ─── User listings ─────────────────────────────────────

  async findMyListings(userId: string): Promise<Classified[]> {
    return this.classifiedRepository.find({
      where: { user_id: userId },
      relations: ['category', 'images'],
      order: { created_at: 'DESC' },
    });
  }

  // ─── Categories ────────────────────────────────────────

  async findAllCategories(): Promise<ClassifiedCategory[]> {
    return this.categoryRepository.find({
      where: { is_active: true, parent_id: IsNull() },
      relations: ['children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryTree(): Promise<ClassifiedCategory[]> {
    const roots = await this.categoryRepository.find({
      where: { is_active: true, parent_id: IsNull() },
      relations: ['children', 'children.children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    for (const root of roots) {
      if (root.children) {
        root.children = root.children
          .filter((c) => c.is_active)
          .sort((a, b) => a.sort_order - b.sort_order);
        for (const child of root.children) {
          if (child.children) {
            child.children = child.children
              .filter((c) => c.is_active)
              .sort((a, b) => a.sort_order - b.sort_order);
          }
        }
      }
    }

    // Attach listing counts after filtering
    const countsMap = await this.getCountsByClassifiedCategory();
    for (const root of roots) {
      let rootTotal = countsMap.get(root.id) || 0;
      if (root.children) {
        for (const child of root.children) {
          let childTotal = countsMap.get(child.id) || 0;
          if (child.children) {
            for (const grandchild of child.children) {
              const gcCount = countsMap.get(grandchild.id) || 0;
              (grandchild as any).listing_count = gcCount;
              childTotal += gcCount;
            }
          }
          (child as any).listing_count = childTotal;
          rootTotal += childTotal;
        }
      }
      (root as any).listing_count = rootTotal;
    }

    return roots;
  }

  // ─── Image management ─────────────────────────────────

  async addImage(
    classifiedId: string,
    userId: string,
    url: string,
    thumbnailUrl?: string,
  ): Promise<ClassifiedImage> {
    const classified = await this.findById(classifiedId);

    if (classified.user_id !== userId) {
      throw new ForbiddenException(
        'You can only add images to your own listings',
      );
    }

    // Check max 8 images
    const imageCount = await this.imageRepository.count({
      where: { classified_id: classifiedId },
    });
    if (imageCount >= 8) {
      throw new BadRequestException('Maximum of 8 images per listing');
    }

    const image = this.imageRepository.create({
      classified_id: classifiedId,
      url,
      thumbnail_url: thumbnailUrl || null,
      sort_order: imageCount,
    });

    return this.imageRepository.save(image);
  }

  async removeImage(
    classifiedId: string,
    imageId: string,
    userId: string,
  ): Promise<void> {
    const classified = await this.findById(classifiedId);

    if (classified.user_id !== userId) {
      throw new ForbiddenException(
        'You can only remove images from your own listings',
      );
    }

    const image = await this.imageRepository.findOne({
      where: { id: imageId, classified_id: classifiedId },
    });

    if (!image) {
      throw new NotFoundException(
        `Image with id "${imageId}" not found for classified "${classifiedId}"`,
      );
    }

    await this.imageRepository.remove(image);
  }

  // ─── Moderation workflow ───────────────────────────────

  async submitForModeration(
    id: string,
    userId: string,
  ): Promise<Classified> {
    const classified = await this.findById(id);

    if (classified.user_id !== userId) {
      throw new ForbiddenException('You can only submit your own listings');
    }

    if (
      classified.status !== ClassifiedStatus.DRAFT &&
      classified.status !== ClassifiedStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Only draft or rejected listings can be submitted for moderation',
      );
    }

    classified.status = ClassifiedStatus.PENDING;
    await this.classifiedRepository.save(classified);
    return this.findById(classified.id);
  }

  async moderate(
    id: string,
    action: 'approve' | 'reject',
    moderatorNotes?: string,
  ): Promise<Classified> {
    const classified = await this.findById(id);

    if (classified.status !== ClassifiedStatus.PENDING) {
      throw new BadRequestException(
        'Only pending listings can be moderated',
      );
    }

    if (action === 'approve') {
      classified.status = ClassifiedStatus.ACTIVE;
      // Set expiry to 30 days from approval
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      classified.expires_at = expiresAt;
    } else {
      classified.status = ClassifiedStatus.REJECTED;
    }

    classified.moderator_notes = moderatorNotes
      ? this.sanitizeHtml(moderatorNotes)
      : null;

    await this.classifiedRepository.save(classified);
    return this.findById(classified.id);
  }

  // ─── Messaging ─────────────────────────────────────────

  async sendMessage(
    classifiedId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<ClassifiedMessage> {
    const classified = await this.findById(classifiedId);

    if (classified.user_id === senderId) {
      throw new BadRequestException('You cannot message your own listing');
    }

    const message = this.messageRepository.create({
      classified_id: classifiedId,
      sender_id: senderId,
      recipient_id: classified.user_id,
      message: this.sanitizeHtml(dto.message),
    });

    return this.messageRepository.save(message);
  }

  async getConversations(
    userId: string,
  ): Promise<
    {
      classified_id: string;
      classified_title: string;
      other_user_id: string;
      other_user_name: string;
      last_message: string;
      last_message_at: Date;
      unread_count: number;
    }[]
  > {
    const messages = await this.messageRepository
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.classified', 'classified')
      .leftJoinAndSelect('msg.sender', 'sender')
      .leftJoinAndSelect('msg.recipient', 'recipient')
      .where('msg.sender_id = :userId OR msg.recipient_id = :userId', {
        userId,
      })
      .orderBy('msg.created_at', 'DESC')
      .getMany();

    const conversationMap = new Map<
      string,
      {
        classified_id: string;
        classified_title: string;
        other_user_id: string;
        other_user_name: string;
        last_message: string;
        last_message_at: Date;
        unread_count: number;
      }
    >();

    for (const msg of messages) {
      const otherUserId =
        msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      const key = `${msg.classified_id}-${otherUserId}`;

      if (!conversationMap.has(key)) {
        const otherUser =
          msg.sender_id === userId ? msg.recipient : msg.sender;
        conversationMap.set(key, {
          classified_id: msg.classified_id,
          classified_title: msg.classified?.title || '',
          other_user_id: otherUserId,
          other_user_name: otherUser?.display_name || '',
          last_message: msg.message,
          last_message_at: msg.created_at,
          unread_count: 0,
        });
      }

      if (msg.recipient_id === userId && !msg.is_read) {
        const conv = conversationMap.get(key)!;
        conv.unread_count++;
      }
    }

    return Array.from(conversationMap.values());
  }

  async getThread(
    classifiedId: string,
    userId: string,
  ): Promise<ClassifiedMessage[]> {
    const messages = await this.messageRepository.find({
      where: [
        { classified_id: classifiedId, sender_id: userId },
        { classified_id: classifiedId, recipient_id: userId },
      ],
      relations: ['sender', 'recipient'],
      order: { created_at: 'ASC' },
    });

    // Mark unread messages as read
    const unreadIds = messages
      .filter((m) => m.recipient_id === userId && !m.is_read)
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      await this.messageRepository
        .createQueryBuilder()
        .update(ClassifiedMessage)
        .set({ is_read: true })
        .whereInIds(unreadIds)
        .execute();
    }

    return messages;
  }

  // ─── Reporting ─────────────────────────────────────────

  async createReport(
    classifiedId: string,
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<ClassifiedReport> {
    await this.findById(classifiedId);

    const report = this.reportRepository.create({
      classified_id: classifiedId,
      reporter_id: reporterId,
      reason: dto.reason,
      description: dto.description
        ? this.sanitizeHtml(dto.description)
        : null,
    });

    return this.reportRepository.save(report);
  }

  async findAllReports(): Promise<ClassifiedReport[]> {
    return this.reportRepository.find({
      relations: ['classified', 'reporter'],
      order: { created_at: 'DESC' },
    });
  }

  async updateReport(
    id: string,
    status: ClassifiedReportStatus,
    adminNotes?: string,
  ): Promise<ClassifiedReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['classified', 'reporter'],
    });

    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }

    report.status = status;
    if (adminNotes !== undefined) {
      report.admin_notes = adminNotes
        ? this.sanitizeHtml(adminNotes)
        : null;
    }

    return this.reportRepository.save(report);
  }

  // ─── Auto-expire cron ─────────────────────────────────

  async expireListings(): Promise<number> {
    const result = await this.classifiedRepository
      .createQueryBuilder()
      .update(Classified)
      .set({ status: ClassifiedStatus.EXPIRED })
      .where('status = :status', { status: ClassifiedStatus.ACTIVE })
      .andWhere('expires_at < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  // ─── Admin helpers ─────────────────────────────────────

  async findAllAdmin(
    query: ClassifiedQueryDto,
  ): Promise<{
    data: Classified[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.classifiedRepository
      .createQueryBuilder('classified')
      .leftJoinAndSelect('classified.category', 'category')
      .leftJoinAndSelect('classified.images', 'images')
      .leftJoin('classified.user', 'user')
      .addSelect(['user.id', 'user.display_name', 'user.email']);

    if (query.status) {
      qb.andWhere('classified.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(classified.title ILIKE :search OR classified.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  // ─── Category schema management ───────────────────────

  async findCategoryBySlug(slug: string): Promise<ClassifiedCategory> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async updateCategorySchema(
    id: string,
    schema: CategoryFieldDefinition[],
  ): Promise<ClassifiedCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    category.field_schema = schema;
    return this.categoryRepository.save(category);
  }

  // ─── Admin Category CRUD ─────────────────────────────

  async findAllCategoriesAdmin(): Promise<ClassifiedCategory[]> {
    return this.categoryRepository.find({
      relations: ['children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async createCategory(dto: CreateClassifiedCategoryDto): Promise<ClassifiedCategory> {
    const slug = dto.slug || generateSlug(dto.name);

    // Check slug uniqueness
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`A category with slug "${slug}" already exists`);
    }

    // Validate parent depth
    if (dto.parent_id) {
      await this.validateParentDepth(dto.parent_id);
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      slug,
      description: dto.description || null,
      icon: dto.icon || null,
      parent_id: dto.parent_id || null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategoryAdmin(id: string, dto: UpdateClassifiedCategoryDto): Promise<ClassifiedCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
      // Re-generate slug if name changed and no explicit slug provided
      if (dto.slug === undefined) {
        const newSlug = generateSlug(dto.name);
        const existing = await this.categoryRepository.findOne({ where: { slug: newSlug } });
        if (!existing || existing.id === id) {
          category.slug = newSlug;
        }
      }
    }

    if (dto.slug !== undefined) {
      const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`A category with slug "${dto.slug}" already exists`);
      }
      category.slug = dto.slug;
    }

    if (dto.parent_id !== undefined) {
      if (dto.parent_id) {
        if (dto.parent_id === id) {
          throw new BadRequestException('A category cannot be its own parent');
        }
        await this.validateParentDepth(dto.parent_id);
      }
      category.parent_id = dto.parent_id || null;
    }

    if (dto.description !== undefined) category.description = dto.description || null;
    if (dto.icon !== undefined) category.icon = dto.icon || null;
    if (dto.sort_order !== undefined) category.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) category.is_active = dto.is_active;

    return this.categoryRepository.save(category);
  }

  async deleteCategoryAdmin(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    // Check for child categories
    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete a category that has subcategories. Remove or reassign them first.',
      );
    }

    // Check for classifieds referencing this category
    const classifiedCount = await this.classifiedRepository.count({
      where: { category_id: id },
    });
    if (classifiedCount > 0) {
      throw new BadRequestException(
        `Cannot delete this category — ${classifiedCount} classified(s) are using it.`,
      );
    }

    await this.categoryRepository.remove(category);
  }

  async reorderCategories(items: { id: string; sort_order: number }[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        await manager.update(ClassifiedCategory, item.id, { sort_order: item.sort_order });
      }
    });
  }

  private async validateParentDepth(parentId: string): Promise<void> {
    const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException(`Parent category with id "${parentId}" not found`);
    }
    // Parent must be at most 2 levels deep (root=0, child=1 → new child would be level 2, max 3 levels)
    if (parent.parent_id) {
      const grandparent = await this.categoryRepository.findOne({ where: { id: parent.parent_id } });
      if (grandparent?.parent_id) {
        throw new BadRequestException('Category hierarchy cannot exceed 3 levels');
      }
    }
  }

  // ─── Private helpers ───────────────────────────────────

  private applySorting(
    qb: SelectQueryBuilder<Classified>,
    sort?: ClassifiedSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.DESC ? 'DESC' : 'ASC';

    switch (sort) {
      case ClassifiedSortField.PRICE:
        qb.orderBy('classified.price', direction);
        break;
      case ClassifiedSortField.TITLE:
        qb.orderBy('classified.title', direction);
        break;
      case ClassifiedSortField.CREATED:
        qb.orderBy('classified.created_at', direction);
        break;
      case ClassifiedSortField.DATE:
      default:
        qb.orderBy('classified.created_at', direction);
        break;
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

  private async getEffectiveFieldSchema(
    category: ClassifiedCategory,
  ): Promise<CategoryFieldDefinition[]> {
    if (category.field_schema?.length > 0) return category.field_schema;
    if (category.parent_id) {
      const parent = await this.categoryRepository.findOne({
        where: { id: category.parent_id },
      });
      if (parent?.field_schema?.length) return parent.field_schema;
      if (parent?.parent_id) {
        const grandparent = await this.categoryRepository.findOne({
          where: { id: parent.parent_id },
        });
        if (grandparent?.field_schema?.length) return grandparent.field_schema;
      }
    }
    return [];
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.classifiedRepository.findOne({
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
}
