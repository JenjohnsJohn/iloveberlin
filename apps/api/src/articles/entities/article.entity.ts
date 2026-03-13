import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Media } from '../../media/entities/media.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { ArticleRevision } from './article-revision.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subtitle!: string | null;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'uuid', nullable: true })
  featured_image_id!: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'featured_image_id' })
  featured_image!: Media | null;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @Column({ type: 'uuid' })
  author_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status!: ArticleStatus;

  @Column({ type: 'timestamptz', nullable: true })
  published_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  view_count!: number;

  @Column({ type: 'int', default: 1 })
  read_time_minutes!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_keywords!: string | null;

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @OneToMany(() => ArticleRevision, (revision) => revision.article)
  revisions!: ArticleRevision[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
