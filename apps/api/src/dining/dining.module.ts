import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Cuisine } from './entities/cuisine.entity';
import { RestaurantImage } from './entities/restaurant-image.entity';
import { DiningOffer } from './entities/dining-offer.entity';
import { Media } from '../media/entities/media.entity';
import { DiningService } from './dining.service';
import { DiningController } from './dining.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      Cuisine,
      RestaurantImage,
      DiningOffer,
      Media,
    ]),
  ],
  providers: [DiningService],
  controllers: [DiningController],
  exports: [DiningService],
})
export class DiningModule {}
