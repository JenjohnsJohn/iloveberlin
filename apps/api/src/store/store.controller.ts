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
import { StoreService } from './store.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateDiscountDto, ValidateDiscountDto } from './dto/create-discount.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ─── Public category endpoints ────────────────────────────

  @Get('categories')
  findAllCategories() {
    return this.storeService.findAllCategories();
  }

  // ─── Public product endpoints ─────────────────────────────
  // NOTE: Named routes MUST come before parameterized :slug route

  @Get('products')
  findAllProducts(@Query() query: ProductQueryDto) {
    return this.storeService.findAllProducts(query, true);
  }

  @Get('products/featured')
  findFeaturedProducts() {
    return this.storeService.findFeaturedProducts();
  }

  // ─── Admin product endpoints ──────────────────────────────

  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllProductsAdmin(@Query() query: ProductQueryDto) {
    return this.storeService.findAllProducts(query, false);
  }

  @Get('admin/products/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findProductBySlugAdmin(@Param('slug') slug: string) {
    return this.storeService.findProductBySlug(slug, false);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createProduct(@Body() dto: CreateProductDto) {
    return this.storeService.createProduct(dto);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.storeService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeService.deleteProduct(id);
  }

  // ─── Cart endpoints ───────────────────────────────────────

  @Get('cart')
  getCart(
    @Req() req: { user?: { id: string } },
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.storeService.getCart(req.user?.id, sessionId);
  }

  @Post('cart/items')
  addToCart(
    @Body() dto: AddToCartDto,
    @Req() req: { user?: { id: string } },
  ) {
    return this.storeService.addToCart(dto, req.user?.id);
  }

  @Put('cart/items/:id')
  updateCartItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: { user?: { id: string } },
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.storeService.updateCartItem(id, dto, req.user?.id, sessionId);
  }

  @Delete('cart/items/:id')
  @HttpCode(HttpStatus.OK)
  removeFromCart(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user?: { id: string } },
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.storeService.removeFromCart(id, req.user?.id, sessionId);
  }

  // ─── Checkout endpoints ───────────────────────────────────

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.storeService.createCheckout(dto, req.user.id);
  }

  // ─── Order endpoints ──────────────────────────────────────

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  getOrders(@Req() req: { user: { id: string } }) {
    return this.storeService.getOrders(req.user.id);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.storeService.getOrderById(id, req.user.id);
  }

  // ─── Admin order endpoints ────────────────────────────────

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAllOrders() {
    return this.storeService.getAllOrders();
  }

  @Patch('admin/orders/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
  ) {
    return this.storeService.updateOrderStatus(id, body.status);
  }

  // ─── Discount endpoints ───────────────────────────────────

  @Post('discounts/validate')
  validateDiscount(@Body() dto: ValidateDiscountDto) {
    return this.storeService.validateDiscount(dto);
  }

  @Post('discounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createDiscount(@Body() dto: CreateDiscountDto) {
    return this.storeService.createDiscount(dto);
  }

  @Get('discounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllDiscounts() {
    return this.storeService.findAllDiscounts();
  }

  @Patch('discounts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateDiscount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateDiscountDto>,
  ) {
    return this.storeService.updateDiscount(id, dto);
  }

  @Delete('discounts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDiscount(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeService.deleteDiscount(id);
  }

  // ─── Public product by slug (MUST be LAST) ────────────────

  @Get('products/:slug')
  findProductBySlug(@Param('slug') slug: string) {
    return this.storeService.findProductBySlug(slug, true);
  }
}
