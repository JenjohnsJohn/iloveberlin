import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { Product } from '../entities/product.entity';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class StoreCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  private async getCountsByProductCategory(): Promise<Map<string, number>> {
    const rows: { category_id: string; count: number }[] = await this.dataSource.query(
      `SELECT category_id, COUNT(*)::int AS count
       FROM products
       WHERE status = 'active' AND deleted_at IS NULL AND category_id IS NOT NULL
       GROUP BY category_id`,
    );
    return new Map(rows.map((r) => [r.category_id, r.count]));
  }

  async findAllCategories(): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryTree(): Promise<ProductCategory[]> {
    const roots = await this.categoryRepository.find({
      where: { is_active: true, parent_id: IsNull() },
      relations: ['children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });

    const countsMap = await this.getCountsByProductCategory();
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

  async getCategoryAndDescendantIds(slug: string): Promise<string[]> {
    const category = await this.categoryRepository.findOne({
      where: { slug, is_active: true },
    });
    if (!category) return [];

    const children = await this.categoryRepository.find({
      where: { parent_id: category.id, is_active: true },
    });

    return [
      category.id,
      ...children.map((c) => c.id),
    ];
  }

  async validateCategory(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Product category with id "${categoryId}" does not exist`,
      );
    }
  }

  async createCategory(data: {
    name: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
  }): Promise<ProductCategory> {
    const slug = generateSlug(data.name);
    const category = this.categoryRepository.create({
      name: data.name,
      slug,
      description: data.description || null,
      image_url: data.image_url || null,
      sort_order: data.sort_order ?? 0,
      is_active: true,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    data: { name?: string; description?: string; image_url?: string; sort_order?: number; is_active?: boolean },
  ): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Product category with id "${id}" not found`);
    }

    if (data.name !== undefined) category.name = data.name;
    if (data.description !== undefined) category.description = data.description || null;
    if (data.image_url !== undefined) category.image_url = data.image_url || null;
    if (data.sort_order !== undefined) category.sort_order = data.sort_order;
    if (data.is_active !== undefined) category.is_active = data.is_active;

    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Product category with id "${id}" not found`);
    }

    const productCount = await this.productRepository.count({
      where: { category_id: id },
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.name}" - it has ${productCount} associated product(s). Reassign or delete them first.`,
      );
    }

    await this.categoryRepository.remove(category);
  }
}
