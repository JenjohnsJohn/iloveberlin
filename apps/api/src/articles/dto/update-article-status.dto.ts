import { IsEnum } from 'class-validator';
import { ArticleStatus } from '../entities/article.entity';

export class UpdateArticleStatusDto {
  @IsEnum(ArticleStatus)
  status!: ArticleStatus;
}
