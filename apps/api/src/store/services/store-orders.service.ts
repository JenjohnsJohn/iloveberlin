import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CartItem } from '../entities/cart-item.entity';
import { DiscountType } from '../entities/discount-code.entity';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';
import { StoreCartService } from './store-cart.service';
import { StoreDiscountsService } from './store-discounts.service';
import { sanitize } from '../../common/utils/sanitize.util';

@Injectable()
export class StoreOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly cartService: StoreCartService,
    private readonly discountsService: StoreDiscountsService,
  ) {}

  private sanitizeHtml(input: string): string {
    return sanitize(input);
  }

  async createCheckout(
    dto: CreateCheckoutDto,
    userId?: string,
  ): Promise<Order> {
    const cart = await this.cartService.getCart(userId, dto.session_id);

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
      const discount = await this.discountsService.validateDiscountInternal(
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
        await this.discountsService.incrementUsedCount(discount);
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
}
