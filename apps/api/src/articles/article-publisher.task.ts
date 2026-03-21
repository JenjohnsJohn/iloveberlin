import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Article, ArticleStatus } from './entities/article.entity';

@Injectable()
export class ArticlePublisherTask {
  private readonly logger = new Logger(ArticlePublisherTask.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  @Cron('*/5 * * * *')
  async publishScheduledArticles(): Promise<void> {
    const now = new Date();
    let publishedCount = 0;

    try {
      const articles = await this.articleRepository.find({
        where: {
          status: ArticleStatus.SCHEDULED,
          scheduled_at: LessThanOrEqual(now),
        },
      });

      if (articles.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${articles.length} scheduled article(s) ready to publish`,
      );

      for (const article of articles) {
        try {
          article.status = ArticleStatus.PUBLISHED;
          article.published_at = now;
          await this.articleRepository.save(article);
          publishedCount++;
          this.logger.log(
            `Published article "${article.title}" (${article.id})`,
          );
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.error(
            `Failed to publish article "${article.title}" (${article.id}): ${err.message}`,
            err.stack,
          );
        }
      }

      this.logger.log(
        `Auto-publish complete: ${publishedCount}/${articles.length} article(s) published`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to query scheduled articles: ${err.message}`,
        err.stack,
      );
    }
  }
}
