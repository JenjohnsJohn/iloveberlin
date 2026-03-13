import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { Guide } from '../guides/entities/guide.entity';
import { Event } from '../events/entities/event.entity';
import { Restaurant } from '../dining/entities/restaurant.entity';
import { Video } from '../videos/entities/video.entity';
import { Classified } from '../classifieds/entities/classified.entity';
import { Product } from '../store/entities/product.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article, Guide, Event, Restaurant, Video, Classified, Product,
    ]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
