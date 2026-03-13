import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { DiscountCode } from './entities/discount-code.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductCategory,
      Product,
      ProductVariant,
      ProductImage,
      Cart,
      CartItem,
      Order,
      OrderItem,
      DiscountCode,
    ]),
  ],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
