import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ArticleRevision } from './entities/article-revision.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Category } from '../categories/entities/category.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { ArticlePublisherTask } from './article-publisher.task';
import { RedisService } from '../common/services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, ArticleRevision, Tag, Category])],
  providers: [ArticlesService, ArticlePublisherTask, RedisService],
  controllers: [ArticlesController],
  exports: [ArticlesService, RedisService],
})
export class ArticlesModule {}
