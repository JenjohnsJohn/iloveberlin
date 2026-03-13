import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Classified } from './classified.entity';
import { User } from '../../users/entities/user.entity';

@Entity('classified_messages')
export class ClassifiedMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  classified_id!: string;

  @ManyToOne(() => Classified, (classified) => classified.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classified_id' })
  classified!: Classified;

  @Column({ type: 'uuid' })
  sender_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ type: 'uuid' })
  recipient_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient!: User;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'boolean', default: false })
  is_read!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
