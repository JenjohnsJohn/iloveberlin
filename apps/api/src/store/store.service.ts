import { Injectable } from '@nestjs/common';
import { StoreCategoriesService } from './services/store-categories.service';
import { StoreProductsService } from './services/store-products.service';
import { StoreCartService } from './services/store-cart.service';
import { StoreOrdersService } from './services/store-orders.service';
import { StoreDiscountsService } from './services/store-discounts.service';
import { ProductCategory } from './entities/product-category.entity';
import { Product } from './entities/product.entity';
import { Cart } from './entities/cart.entity';
import { Order } from './entities/order.entity';
import { DiscountCode } from './entities/discount-code.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateDiscountDto, ValidateDiscountDto } from './dto/create-discount.dto';

/**
 * Thin facade that delegates to focused sub-services.
 * Kept for backward compatibility — any external module importing
 * StoreService will continue to work without changes.
 */
@Injectable()
export class StoreService {
  constructor(
    private readonly categoriesService: StoreCategoriesService,
    private readonly productsService: StoreProductsService,
    private readonly cartService: StoreCartService,
    private readonly ordersService: StoreOrdersService,
    private readonly discountsService: StoreDiscountsService,
  ) {}

  // ─── Categories ─────────────────────────────────────────────

  findAllCategories(): Promise<ProductCategory[]> {
    return this.categoriesService.findAllCategories();
  }

  findCategoryTree(): Promise<ProductCategory[]> {
    return this.categoriesService.findCategoryTree();
  }

  createCategory(data: {
    name: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
  }): Promise<ProductCategory> {
    return this.categoriesService.createCategory(data);
  }

  updateCategory(
    id: string,
    data: { name?: string; description?: string; image_url?: string; sort_order?: number; is_active?: boolean },
  ): Promise<ProductCategory> {
    return this.categoriesService.updateCategory(id, data);
  }

  deleteCategory(id: string): Promise<void> {
    return this.categoriesService.deleteCategory(id);
  }

  // ─── Products ───────────────────────────────────────────────

  createProduct(dto: CreateProductDto): Promise<Product> {
    return this.productsService.createProduct(dto);
  }

  updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    return this.productsService.updateProduct(id, dto);
  }

  findAllProducts(
    query: ProductQueryDto,
    isPublicOnly?: boolean,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return this.productsService.findAllProducts(query, isPublicOnly);
  }

  findFeaturedProducts(): Promise<Product[]> {
    return this.productsService.findFeaturedProducts();
  }

  findProductBySlug(slug: string, publicOnly?: boolean): Promise<Product> {
    return this.productsService.findProductBySlug(slug, publicOnly);
  }

  findProductById(id: string): Promise<Product> {
    return this.productsService.findProductById(id);
  }

  deleteProduct(id: string): Promise<void> {
    return this.productsService.deleteProduct(id);
  }

  // ─── Cart ───────────────────────────────────────────────────

  getCart(userId?: string, sessionId?: string): Promise<Cart> {
    return this.cartService.getCart(userId, sessionId);
  }

  addToCart(dto: AddToCartDto, userId?: string): Promise<Cart> {
    return this.cartService.addToCart(dto, userId);
  }

  updateCartItem(
    itemId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    return this.cartService.updateCartItem(itemId, dto, userId, sessionId);
  }

  removeFromCart(
    itemId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    return this.cartService.removeFromCart(itemId, userId, sessionId);
  }

  // ─── Orders ─────────────────────────────────────────────────

  createCheckout(dto: CreateCheckoutDto, userId?: string): Promise<Order> {
    return this.ordersService.createCheckout(dto, userId);
  }

  getOrders(userId: string): Promise<{ data: Order[]; total: number }> {
    return this.ordersService.getOrders(userId);
  }

  getOrderById(id: string, userId?: string): Promise<Order> {
    return this.ordersService.getOrderById(id, userId);
  }

  getAllOrders(): Promise<{ data: Order[]; total: number }> {
    return this.ordersService.getAllOrders();
  }

  updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, status);
  }

  // ─── Discounts ──────────────────────────────────────────────

  validateDiscount(
    dto: ValidateDiscountDto,
  ): Promise<{ valid: boolean; discount?: DiscountCode; message?: string }> {
    return this.discountsService.validateDiscount(dto);
  }

  createDiscount(dto: CreateDiscountDto): Promise<DiscountCode> {
    return this.discountsService.createDiscount(dto);
  }

  findAllDiscounts(): Promise<DiscountCode[]> {
    return this.discountsService.findAllDiscounts();
  }

  updateDiscount(id: string, dto: Partial<CreateDiscountDto>): Promise<DiscountCode> {
    return this.discountsService.updateDiscount(id, dto);
  }

  deleteDiscount(id: string): Promise<void> {
    return this.discountsService.deleteDiscount(id);
  }
}
