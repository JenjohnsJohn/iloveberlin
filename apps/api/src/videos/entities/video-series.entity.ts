import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Media } from '../../media/entities/media.entity';
import { Video } from './video.entity';

@Entity('video_series')
export class VideoSeries {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'uuid', nullable: true })
  thumbnail_id!: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail!: Media | null;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @OneToMany(() => Video, (video) => video.series)
  videos!: Video[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
