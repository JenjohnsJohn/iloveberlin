import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Classified } from './classified.entity';

@Entity('classified_images')
export class ClassifiedImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  classified_id!: string;

  @ManyToOne(() => Classified, (classified) => classified.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classified_id' })
  classified!: Classified;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url!: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
