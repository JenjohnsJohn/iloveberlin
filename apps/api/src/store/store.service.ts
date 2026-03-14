import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, SelectQueryBuilder, DataSource } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DiscountCode, DiscountType } from './entities/discount-code.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductQueryDto,
  ProductSortField,
  SortOrder,
} from './dto/product-query.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateDiscountDto, ValidateDiscountDto } from './dto/create-discount.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(DiscountCode)
    private readonly discountRepository: Repository<DiscountCode>,
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

  // ─── Sanitization ───────────────────────────────────────

  private sanitizeHtml(input: string): string {
    let text = input;
    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<iframe[\s\S]*?srcdoc[\s\S]*?>/gi, '');
    text = text.replace(/<object[\s\S]*?<\/object>/gi, '');
    text = text.replace(/<embed[\s\S]*?>/gi, '');
    text = text.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    text = text.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
    text = text.replace(/javascript\s*:/gi, '');
    return text;
  }

  // ─── FK Validation ──────────────────────────────────────

  private async validateCategory(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Product category with id "${categoryId}" does not exist`,
      );
    }
  }

  // ─── Product Categories ───────────────────────────────────

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

  private async getCategoryAndDescendantIds(slug: string): Promise<string[]> {
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

  // ─── Products CRUD ────────────────────────────────────────

  async createProduct(dto: CreateProductDto): Promise<Product> {
    if (dto.category_id) {
      await this.validateCategory(dto.category_id);
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
      await this.validateCategory(dto.category_id);
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
    const page = query.page || 1;
    const limit = query.limit || 20;

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
      const categoryIds = await this.getCategoryAndDescendantIds(query.category);
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

    qb.skip((page - 1) * limit).take(limit);

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

  // ─── Cart Management ──────────────────────────────────────

  async getCart(userId?: string, sessionId?: string): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { user_id: userId },
        relations: ['items', 'items.product', 'items.product.images', 'items.variant'],
      });
    } else if (sessionId) {
      cart = await this.cartRepository.findOne({
        where: { session_id: sessionId },
        relations: ['items', 'items.product', 'items.product.images', 'items.variant'],
      });
    }

    if (!cart) {
      // Create a new cart
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Cart expires in 30 days

      cart = this.cartRepository.create({
        user_id: userId || null,
        session_id: sessionId || null,
        expires_at: expiresAt,
      });
      cart = await this.cartRepository.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addToCart(dto: AddToCartDto, userId?: string): Promise<Cart> {
    const product = await this.findProductById(dto.product_id);

    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available for purchase');
    }

    const cart = await this.getCart(userId, dto.session_id);

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.product_id === dto.product_id &&
        item.variant_id === (dto.variant_id || null),
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity || 1;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cart_id: cart.id,
        product_id: dto.product_id,
        variant_id: dto.variant_id || null,
        quantity: dto.quantity || 1,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(userId, dto.session_id);
  }

  async updateCartItem(
    itemId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with id "${itemId}" not found`);
    }

    // Verify ownership
    const cart = cartItem.cart;
    if (userId && cart.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to modify this cart item');
    }
    if (!userId && sessionId && cart.session_id !== sessionId) {
      throw new ForbiddenException('You do not have permission to modify this cart item');
    }

    cartItem.quantity = dto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getCart(userId, sessionId);
  }

  async removeFromCart(
    itemId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with id "${itemId}" not found`);
    }

    // Verify ownership
    const cart = cartItem.cart;
    if (userId && cart.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to remove this cart item');
    }
    if (!userId && sessionId && cart.session_id !== sessionId) {
      throw new ForbiddenException('You do not have permission to remove this cart item');
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getCart(userId, sessionId);
  }

  // ─── Checkout ─────────────────────────────────────────────

  async createCheckout(
    dto: CreateCheckoutDto,
    userId?: string,
  ): Promise<Order> {
    const cart = await this.getCart(userId, dto.session_id);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData: Array<{
      product_id: string;
      variant_id: string | null;
      product_name: string;
      variant_name: string | null;
      price: number;
      quantity: number;
      total: number;
    }> = [];

    for (const item of cart.items) {
      const price = item.variant
        ? Number(item.variant.price)
        : Number(item.product.base_price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product.name,
        variant_name: item.variant ? item.variant.name : null,
        price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Apply discount if provided
    let discountAmount = 0;
    if (dto.discount_code) {
      const discount = await this.validateDiscountInternal(
        dto.discount_code,
        subtotal,
      );
      if (discount) {
        if (discount.type === DiscountType.PERCENTAGE) {
          discountAmount = subtotal * (Number(discount.value) / 100);
        } else {
          discountAmount = Number(discount.value);
        }
        // Increment used_count
        discount.used_count += 1;
        await this.discountRepository.save(discount);
      }
    }

    const total = subtotal - discountAmount;

    // Generate order number with crypto-secure random suffix
    const { randomInt } = await import('crypto');
    const orderNumber = `ILB-${Date.now()}-${randomInt(1000, 9999)}`;

    // NOTE: Stripe payment integration planned. Orders start as PENDING
    // and can be marked as PAID via admin order status update.
    const order = this.orderRepository.create({
      user_id: userId || null,
      order_number: orderNumber,
      status: OrderStatus.PENDING,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: 0,
      shipping_amount: 0,
      total,
      currency: 'EUR',
      payment_intent_id: null,
      payment_method: 'stub',
      shipping_name: this.sanitizeHtml(dto.shipping_name),
      shipping_email: dto.shipping_email,
      shipping_address: this.sanitizeHtml(dto.shipping_address),
      shipping_city: this.sanitizeHtml(dto.shipping_city),
      shipping_postal_code: dto.shipping_postal_code,
      shipping_country: this.sanitizeHtml(dto.shipping_country),
      notes: dto.notes ? this.sanitizeHtml(dto.notes) : null,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = orderItemsData.map((itemData) =>
      this.orderItemRepository.create({
        order_id: savedOrder.id,
        ...itemData,
      }),
    );
    await this.orderItemRepository.save(orderItems);

    // Clear the cart
    await this.cartItemRepository.remove(cart.items);

    return this.getOrderById(savedOrder.id, userId);
  }

  // ─── Orders ───────────────────────────────────────────────

  async getOrders(
    userId: string,
  ): Promise<{ data: Order[]; total: number }> {
    const [data, total] = await this.orderRepository.findAndCount({
      where: { user_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async getOrderById(id: string, userId?: string): Promise<Order> {
    const where: Record<string, unknown> = { id };
    if (userId) {
      where.user_id = userId;
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    return order;
  }

  // ─── Discount Codes ───────────────────────────────────────

  async validateDiscount(
    dto: ValidateDiscountDto,
  ): Promise<{ valid: boolean; discount?: DiscountCode; message?: string }> {
    const discount = await this.validateDiscountInternal(
      dto.code,
      dto.order_total || 0,
    );

    if (!discount) {
      return { valid: false, message: 'Invalid or expired discount code' };
    }

    return { valid: true, discount };
  }

  async createDiscount(dto: CreateDiscountDto): Promise<DiscountCode> {
    const discount = this.discountRepository.create({
      code: dto.code.toUpperCase(),
      description: dto.description
        ? this.sanitizeHtml(dto.description)
        : null,
      type: dto.type || DiscountType.PERCENTAGE,
      value: dto.value,
      min_order_amount: dto.min_order_amount || null,
      max_uses: dto.max_uses || null,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : null,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    return this.discountRepository.save(discount);
  }

  async findAllDiscounts(): Promise<DiscountCode[]> {
    return this.discountRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async updateDiscount(
    id: string,
    dto: Partial<CreateDiscountDto>,
  ): Promise<DiscountCode> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with id "${id}" not found`);
    }

    if (dto.code) discount.code = dto.code.toUpperCase();
    if (dto.description !== undefined)
      discount.description = dto.description ? this.sanitizeHtml(dto.description) : null;
    if (dto.type) discount.type = dto.type;
    if (dto.value !== undefined) discount.value = dto.value;
    if (dto.is_active !== undefined) discount.is_active = dto.is_active;

    return this.discountRepository.save(discount);
  }

  async deleteDiscount(id: string): Promise<void> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with id "${id}" not found`);
    }
    await this.discountRepository.remove(discount);
  }

  // ─── Admin Orders ──────────────────────────────────────────

  async getAllOrders(): Promise<{ data: Order[]; total: number }> {
    const [data, total] = await this.orderRepository.findAndCount({
      relations: ['items', 'user'],
      order: { created_at: 'DESC' },
    });
    return { data, total };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Valid: ${validStatuses.join(', ')}`);
    }

    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
  }

  // ─── Private helpers ──────────────────────────────────────

  private async validateDiscountInternal(
    code: string,
    orderTotal: number,
  ): Promise<DiscountCode | null> {
    const discount = await this.discountRepository.findOne({
      where: { code: code.toUpperCase(), is_active: true },
    });

    if (!discount) return null;

    const now = new Date();
    if (discount.starts_at && discount.starts_at > now) return null;
    if (discount.expires_at && discount.expires_at < now) return null;
    if (discount.max_uses && discount.used_count >= discount.max_uses)
      return null;
    if (
      discount.min_order_amount &&
      orderTotal < Number(discount.min_order_amount)
    )
      return null;

    return discount;
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
