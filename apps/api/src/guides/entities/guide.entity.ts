import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Media } from '../../media/entities/media.entity';
import { GuideTopic } from './guide-topic.entity';

export enum GuideStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('guides')
export class Guide {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  topic_id!: string | null;

  @ManyToOne(() => GuideTopic, (topic) => topic.guides, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'topic_id' })
  topic!: GuideTopic | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

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

  @Column({ type: 'uuid' })
  author_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({
    type: 'enum',
    enum: GuideStatus,
    default: GuideStatus.DRAFT,
  })
  status!: GuideStatus;

  @Column({ type: 'timestamptz', nullable: true })
  last_reviewed_at!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  seo_title!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seo_description!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  published_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
