import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  user_id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'boolean', default: true })
  email_new_articles!: boolean;

  @Column({ type: 'boolean', default: true })
  email_events!: boolean;

  @Column({ type: 'boolean', default: true })
  email_competitions!: boolean;

  @Column({ type: 'boolean', default: true })
  email_newsletter!: boolean;

  @Column({ type: 'boolean', default: true })
  push_new_articles!: boolean;

  @Column({ type: 'boolean', default: true })
  push_events!: boolean;

  @Column({ type: 'boolean', default: true })
  push_competitions!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
