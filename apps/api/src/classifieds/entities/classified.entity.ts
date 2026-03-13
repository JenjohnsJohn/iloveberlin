import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClassifiedCategory } from './classified-category.entity';
import { ClassifiedImage } from './classified-image.entity';
import { ClassifiedMessage } from './classified-message.entity';
import { ClassifiedReport } from './classified-report.entity';

export enum ClassifiedPriceType {
  FIXED = 'fixed',
  NEGOTIABLE = 'negotiable',
  FREE = 'free',
  ON_REQUEST = 'on_request',
}

export enum ClassifiedCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum ClassifiedStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SOLD = 'sold',
  DELETED = 'deleted',
}

@Entity('classifieds')
export class Classified {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  category_id!: string;

  @ManyToOne(() => ClassifiedCategory, (category) => category.classifieds, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ClassifiedCategory;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  @Column({
    type: 'enum',
    enum: ClassifiedPriceType,
    default: ClassifiedPriceType.FIXED,
  })
  price_type!: ClassifiedPriceType;

  @Column({
    type: 'enum',
    enum: ClassifiedCondition,
    nullable: true,
  })
  condition!: ClassifiedCondition | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district!: string | null;

  @Column({ type: 'jsonb', default: '{}' })
  category_fields!: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ClassifiedStatus,
    default: ClassifiedStatus.DRAFT,
  })
  status!: ClassifiedStatus;

  @Column({ type: 'text', nullable: true })
  moderator_notes!: string | null;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  view_count!: number;

  @OneToMany(() => ClassifiedImage, (image) => image.classified)
  images!: ClassifiedImage[];

  @OneToMany(() => ClassifiedMessage, (message) => message.classified)
  messages!: ClassifiedMessage[];

  @OneToMany(() => ClassifiedReport, (report) => report.classified)
  reports!: ClassifiedReport[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
