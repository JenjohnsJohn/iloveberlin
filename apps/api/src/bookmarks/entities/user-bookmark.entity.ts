import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_bookmarks')
@Unique('UQ_user_bookmarks_unique', ['user_id', 'bookmarkable_type', 'bookmarkable_id'])
export class UserBookmark {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 50 })
  bookmarkable_type!: string;

  @Column({ type: 'uuid' })
  bookmarkable_id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
