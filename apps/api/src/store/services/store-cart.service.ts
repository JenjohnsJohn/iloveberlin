import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { ProductStatus } from '../entities/product.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { StoreProductsService } from './store-products.service';

@Injectable()
export class StoreCartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: StoreProductsService,
  ) {}

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
    const product = await this.productsService.findProductById(dto.product_id);

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
}
