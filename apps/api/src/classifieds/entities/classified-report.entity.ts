import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Classified } from './classified.entity';
import { User } from '../../users/entities/user.entity';

export enum ClassifiedReportReason {
  SPAM = 'spam',
  PROHIBITED = 'prohibited',
  FRAUD = 'fraud',
  OFFENSIVE = 'offensive',
  OTHER = 'other',
}

export enum ClassifiedReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('classified_reports')
export class ClassifiedReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  classified_id!: string;

  @ManyToOne(() => Classified, (classified) => classified.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classified_id' })
  classified!: Classified;

  @Column({ type: 'uuid' })
  reporter_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @Column({
    type: 'enum',
    enum: ClassifiedReportReason,
  })
  reason!: ClassifiedReportReason;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: ClassifiedReportStatus,
    default: ClassifiedReportStatus.PENDING,
  })
  status!: ClassifiedReportStatus;

  @Column({ type: 'text', nullable: true })
  admin_notes!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
