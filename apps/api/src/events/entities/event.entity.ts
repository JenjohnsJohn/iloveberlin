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
import { Venue } from './venue.entity';
import { Category } from '../../categories/entities/category.entity';
import { Media } from '../../media/entities/media.entity';
import { User } from '../../users/entities/user.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  excerpt!: string | null;

  @Column({ type: 'uuid', nullable: true })
  venue_id!: string | null;

  @ManyToOne(() => Venue, (venue) => venue.events, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'venue_id' })
  venue!: Venue | null;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @Column({ type: 'date' })
  start_date!: string;

  @Column({ type: 'date', nullable: true })
  end_date!: string | null;

  @Column({ type: 'time', nullable: true })
  start_time!: string | null;

  @Column({ type: 'time', nullable: true })
  end_time!: string | null;

  @Column({ type: 'boolean', default: false })
  is_recurring!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rrule!: string | null;

  @Column({ type: 'boolean', default: true })
  is_free!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_max!: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ticket_url!: string | null;

  @Column({ type: 'uuid', nullable: true })
  featured_image_id!: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'featured_image_id' })
  featured_image!: Media | null;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status!: EventStatus;

  @Column({ type: 'uuid', nullable: true })
  submitted_by!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'submitted_by' })
  submitter!: User | null;

  @Column({ type: 'uuid', nullable: true })
  approved_by!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'approved_by' })
  approver!: User | null;

  @Column({ type: 'int', default: 0 })
  view_count!: number;

  @Column({ type: 'timestamptz', nullable: true })
  published_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
