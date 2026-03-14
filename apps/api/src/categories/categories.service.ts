import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  private getContentTable(type: string): { table: string; statusCondition: string } | null {
    switch (type) {
      case 'article':
        return { table: 'articles', statusCondition: "status = 'published'" };
      case 'event':
        return { table: 'events', statusCondition: "status = 'published'" };
      case 'video':
        return { table: 'videos', statusCondition: "status = 'published'" };
      case 'competition':
        return { table: 'competitions', statusCondition: "status = 'active'" };
      default:
        return null;
    }
  }

  private async getCountsByCategory(type: string): Promise<Map<string, number>> {
    const config = this.getContentTable(type);
    if (!config) return new Map();

    const rows: { category_id: string; count: number }[] = await this.dataSource.query(
      `SELECT category_id, COUNT(*)::int AS count
       FROM ${config.table}
       WHERE ${config.statusCondition} AND deleted_at IS NULL AND category_id IS NOT NULL
       GROUP BY category_id`,
    );

    return new Map(rows.map((r) => [r.category_id, r.count]));
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug || generateSlug(dto.name);

    const type = dto.type || 'article';
    const existing = await this.categoryRepository.findOne({
      where: { slug, type },
    });
    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists for type "${type}"`);
    }

    if (dto.parent_id) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category not found`);
      }
    }

    const category = this.categoryRepository.create({
      ...dto,
      slug,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(includeInactive = false, type?: string): Promise<Category[]> {
    const where: Record<string, unknown> = {};
    if (!includeInactive) {
      where.is_active = true;
    }
    if (type) {
      where.type = type;
    }

    return this.categoryRepository.find({
      where,
      relations: ['children'],
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async findTree(type?: string): Promise<Category[]> {
    const where: Record<string, unknown> = { parent_id: IsNull(), is_active: true };
    if (type) {
      where.type = type;
    }

    const roots = await this.categoryRepository.find({
      where,
      relations: ['children'],
      order: { display_order: 'ASC', name: 'ASC' },
    });

    if (type) {
      const countsMap = await this.getCountsByCategory(type);
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
    }

    return roots;
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    const type = dto.type || category.type;
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: dto.slug, type },
      });
      if (existing) {
        throw new ConflictException(`Category with slug "${dto.slug}" already exists for type "${type}"`);
      }
    }

    if (dto.name && !dto.slug) {
      const newSlug = generateSlug(dto.name);
      if (newSlug !== category.slug) {
        const existing = await this.categoryRepository.findOne({
          where: { slug: newSlug, type },
        });
        if (!existing) {
          dto.slug = newSlug;
        }
      }
    }

    if (dto.parent_id) {
      if (dto.parent_id === id) {
        throw new ConflictException('A category cannot be its own parent');
      }
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parent_id },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async reorder(
    orderedIds: { id: string; display_order: number }[],
  ): Promise<void> {
    const promises = orderedIds.map(({ id, display_order }) =>
      this.categoryRepository.update(id, { display_order }),
    );
    await Promise.all(promises);
  }
}
