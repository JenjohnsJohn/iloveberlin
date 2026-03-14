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
import { Media } from '../../media/entities/media.entity';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CompetitionEntry } from './competition-entry.entity';

export enum CompetitionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  prize_description!: string | null;

  @Column({ type: 'uuid', nullable: true })
  featured_image_id!: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'featured_image_id' })
  featured_image!: Media | null;

  @Column({ type: 'timestamptz' })
  start_date!: Date;

  @Column({ type: 'timestamptz' })
  end_date!: Date;

  @Column({
    type: 'enum',
    enum: CompetitionStatus,
    default: CompetitionStatus.DRAFT,
  })
  status!: CompetitionStatus;

  @Column({ type: 'text', nullable: true })
  terms_conditions!: string | null;

  @Column({ type: 'int', nullable: true })
  max_entries!: number | null;

  @Column({ type: 'uuid', nullable: true })
  winner_id!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'winner_id' })
  winner!: User | null;

  @Column({ type: 'timestamptz', nullable: true })
  winner_selected_at!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'category_id' })
  category!: Category | null;

  @OneToMany(() => CompetitionEntry, (entry) => entry.competition)
  entries!: CompetitionEntry[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
