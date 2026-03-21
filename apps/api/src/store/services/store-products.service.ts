import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import {
  ProductQueryDto,
  ProductSortField,
  SortOrder,
} from '../dto/product-query.dto';
import { StoreCategoriesService } from './store-categories.service';
import { generateSlug } from '../../common/utils/slug.util';
import { sanitize } from '../../common/utils/sanitize.util';
import { getPaginationParams } from '../../common/utils/pagination.util';

@Injectable()
export class StoreProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly categoriesService: StoreCategoriesService,
  ) {}

  private sanitizeHtml(input: string): string {
    return sanitize(input);
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    if (dto.category_id) {
      await this.categoriesService.validateCategory(dto.category_id);
    }

    const slug = await this.generateUniqueProductSlug(dto.name);

    const product = this.productRepository.create({
      name: this.sanitizeHtml(dto.name),
      slug,
      description: this.sanitizeHtml(dto.description),
      short_description: dto.short_description
        ? this.sanitizeHtml(dto.short_description)
        : null,
      base_price: dto.base_price,
      compare_at_price: dto.compare_at_price || null,
      sku: dto.sku || null,
      status: dto.status || ProductStatus.DRAFT,
      is_featured: dto.is_featured || false,
      is_digital: dto.is_digital || false,
      stock_quantity: dto.stock_quantity || 0,
      sort_order: dto.sort_order || 0,
      meta_title: dto.meta_title
        ? this.sanitizeHtml(dto.meta_title)
        : null,
      meta_description: dto.meta_description
        ? this.sanitizeHtml(dto.meta_description)
        : null,
      category_id: dto.category_id || null,
    });

    const savedProduct = await this.productRepository.save(product);

    // Create variants if provided
    if (dto.variants && dto.variants.length > 0) {
      const variants = dto.variants.map((v) =>
        this.variantRepository.create({
          product_id: savedProduct.id,
          name: this.sanitizeHtml(v.name),
          sku: v.sku,
          price: v.price,
          stock_quantity: v.stock_quantity || 0,
          sort_order: v.sort_order || 0,
          is_active: v.is_active !== undefined ? v.is_active : true,
        }),
      );
      await this.variantRepository.save(variants);
    }

    // Create images if provided
    if (dto.images && dto.images.length > 0) {
      const images = dto.images.map((img) =>
        this.imageRepository.create({
          product_id: savedProduct.id,
          url: img.url,
          thumbnail_url: img.thumbnail_url || null,
          alt_text: img.alt_text
            ? this.sanitizeHtml(img.alt_text)
            : null,
          sort_order: img.sort_order || 0,
          is_primary: img.is_primary || false,
        }),
      );
      await this.imageRepository.save(images);
    }

    return this.findProductById(savedProduct.id);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findProductById(id);

    if (dto.category_id !== undefined && dto.category_id) {
      await this.categoriesService.validateCategory(dto.category_id);
    }

    if (dto.name !== undefined) product.name = this.sanitizeHtml(dto.name);
    if (dto.description !== undefined)
      product.description = this.sanitizeHtml(dto.description);
    if (dto.short_description !== undefined)
      product.short_description = dto.short_description
        ? this.sanitizeHtml(dto.short_description)
        : null;
    if (dto.base_price !== undefined) product.base_price = dto.base_price;
    if (dto.compare_at_price !== undefined)
      product.compare_at_price = dto.compare_at_price || null;
    if (dto.sku !== undefined) product.sku = dto.sku || null;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.is_featured !== undefined) product.is_featured = dto.is_featured;
    if (dto.is_digital !== undefined) product.is_digital = dto.is_digital;
    if (dto.stock_quantity !== undefined) product.stock_quantity = dto.stock_quantity;
    if (dto.sort_order !== undefined) product.sort_order = dto.sort_order;
    if (dto.meta_title !== undefined)
      product.meta_title = dto.meta_title
        ? this.sanitizeHtml(dto.meta_title)
        : null;
    if (dto.meta_description !== undefined)
      product.meta_description = dto.meta_description
        ? this.sanitizeHtml(dto.meta_description)
        : null;
    if (dto.category_id !== undefined)
      product.category_id = dto.category_id || null;

    await this.productRepository.save(product);
    return this.findProductById(product.id);
  }

  async findAllProducts(
    query: ProductQueryDto,
    isPublicOnly = true,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const { skip, take, page, limit } = getPaginationParams(query.page, query.limit);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants');

    if (isPublicOnly) {
      qb.andWhere('product.status = :status', {
        status: ProductStatus.ACTIVE,
      });
    } else if (query.status) {
      qb.andWhere('product.status = :status', {
        status: query.status,
      });
    }

    // Category filter (includes descendants)
    if (query.category) {
      const categoryIds = await this.categoriesService.getCategoryAndDescendantIds(query.category);
      if (categoryIds.length > 0) {
        qb.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    // Price range filter
    if (query.price_min !== undefined) {
      qb.andWhere('product.base_price >= :priceMin', {
        priceMin: query.price_min,
      });
    }
    if (query.price_max !== undefined) {
      qb.andWhere('product.base_price <= :priceMax', {
        priceMax: query.price_max,
      });
    }

    // Featured filter
    if (query.featured !== undefined) {
      qb.andWhere('product.is_featured = :featured', {
        featured: query.featured,
      });
    }

    // Search
    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.short_description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findFeaturedProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { is_featured: true, status: ProductStatus.ACTIVE },
      relations: ['category', 'images', 'variants'],
      order: { sort_order: 'ASC' },
      take: 12,
    });
  }

  async findProductBySlug(
    slug: string,
    publicOnly = true,
  ): Promise<Product> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.slug = :slug', { slug });

    if (publicOnly) {
      qb.andWhere('product.status = :status', {
        status: ProductStatus.ACTIVE,
      });
    }

    const product = await qb.getOne();

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.findProductById(id);
    await this.productRepository.softRemove(product);
  }

  private applySorting(
    qb: SelectQueryBuilder<Product>,
    sort?: ProductSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.DESC ? 'DESC' : 'ASC';

    switch (sort) {
      case ProductSortField.PRICE:
        qb.orderBy('product.base_price', direction);
        break;
      case ProductSortField.CREATED:
        qb.orderBy('product.created_at', direction);
        break;
      case ProductSortField.NAME:
        qb.orderBy('product.name', direction);
        break;
      case ProductSortField.SORT_ORDER:
      default:
        qb.orderBy('product.sort_order', direction);
        break;
    }
  }

  private async generateUniqueProductSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.productRepository.findOne({
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
