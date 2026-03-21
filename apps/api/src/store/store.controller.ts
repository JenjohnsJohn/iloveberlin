import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import { StoreCategoriesService } from './services/store-categories.service';
import { StoreProductsService } from './services/store-products.service';
import { StoreCartService } from './services/store-cart.service';
import { StoreOrdersService } from './services/store-orders.service';
import { StoreDiscountsService } from './services/store-discounts.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateDiscountDto, ValidateDiscountDto } from './dto/create-discount.dto';
import { CreateStoreCategoryDto } from './dto/create-store-category.dto';
import { UpdateStoreCategoryDto } from './dto/update-store-category.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('store')
export class StoreController {
  constructor(
    private readonly categoriesService: StoreCategoriesService,
    private readonly productsService: StoreProductsService,
    private readonly cartService: StoreCartService,
    private readonly ordersService: StoreOrdersService,
    private readonly discountsService: StoreDiscountsService,
  ) {}

  // ─── Public category endpoints ────────────────────────────

  @Get('categories/tree')
  findCategoryTree() {
    return this.categoriesService.findCategoryTree();
  }

  @Get('categories')
  findAllCategories() {
    return this.categoriesService.findAllCategories();
  }

  // ─── Admin category endpoints ────────────────────────────

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createCategory(@Body() dto: CreateStoreCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Put('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  // ─── Public product endpoints ─────────────────────────────
  // NOTE: Named routes MUST come before parameterized :slug route

  @Get('products')
  findAllProducts(@Query() query: ProductQueryDto) {
    return this.productsService.findAllProducts(query, true);
  }

  @Get('products/featured')
  findFeaturedProducts() {
    return this.productsService.findFeaturedProducts();
  }

  // ─── Admin product endpoints ──────────────────────────────

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllProductsAdmin(@Query() query: ProductQueryDto) {
    return this.productsService.findAllProducts(query, false);
  }

  @Get('admin/products/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findProductBySlugAdmin(@Param('slug') slug: string) {
    return this.productsService.findProductBySlug(slug, false);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deleteProduct(id);
  }

  // ─── Cart endpoints ───────────────────────────────────────

  @Get('cart')
  getCart(
    @Req() req: { user?: { id: string } },
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.getCart(req.user?.id, sessionId);
  }

  @Post('cart/items')
  addToCart(
    @Body() dto: AddToCartDto,
    @Req() req: { user?: { id: string } },
  ) {
    return this.cartService.addToCart(dto, req.user?.id);
  }

  @Put('cart/items/:id')
  updateCartItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: { user?: { id: string } },
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.updateCartItem(id, dto, req.user?.id, sessionId);
  }

  @Delete('cart/items/:id')
  @HttpCode(HttpStatus.OK)
  removeFromCart(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user?: { id: string } },
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.removeFromCart(id, req.user?.id, sessionId);
  }

  // ─── Checkout endpoints ───────────────────────────────────

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.createCheckout(dto, req.user.id);
  }

  // ─── Order endpoints ──────────────────────────────────────

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  getOrders(@Req() req: { user: { id: string } }) {
    return this.ordersService.getOrders(req.user.id);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.ordersService.getOrderById(id, req.user.id);
  }

  // ─── Admin order endpoints ────────────────────────────────

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Patch('admin/orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto.status);
  }

  // ─── Discount endpoints ───────────────────────────────────

  @Post('discounts/validate')
  validateDiscount(@Body() dto: ValidateDiscountDto) {
    return this.discountsService.validateDiscount(dto);
  }

  @Post('discounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createDiscount(@Body() dto: CreateDiscountDto) {
    return this.discountsService.createDiscount(dto);
  }

  @Get('discounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllDiscounts() {
    return this.discountsService.findAllDiscounts();
  }

  @Patch('discounts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateDiscount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateDiscountDto>,
  ) {
    return this.discountsService.updateDiscount(id, dto);
  }

  @Delete('discounts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDiscount(@Param('id', ParseUUIDPipe) id: string) {
    return this.discountsService.deleteDiscount(id);
  }

  // ─── Public product by slug (MUST be LAST) ────────────────

  @Get('products/:slug')
  findProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findProductBySlug(slug, true);
  }
}
