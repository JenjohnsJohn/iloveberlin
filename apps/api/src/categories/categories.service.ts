import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug || generateSlug(dto.name);

    const existing = await this.categoryRepository.findOne({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
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

  async findAll(includeInactive = false): Promise<Category[]> {
    const where: Record<string, unknown> = {};
    if (!includeInactive) {
      where.is_active = true;
    }

    return this.categoryRepository.find({
      where,
      relations: ['children'],
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }

  async findTree(): Promise<Category[]> {
    const roots = await this.categoryRepository.find({
      where: { parent_id: IsNull(), is_active: true },
      relations: ['children'],
      order: { display_order: 'ASC', name: 'ASC' },
    });

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

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
      }
    }

    if (dto.name && !dto.slug) {
      const newSlug = generateSlug(dto.name);
      if (newSlug !== category.slug) {
        const existing = await this.categoryRepository.findOne({
          where: { slug: newSlug },
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
