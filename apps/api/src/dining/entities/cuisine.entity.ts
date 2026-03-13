import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('cuisines')
export class Cuisine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug!: string;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @ManyToMany(() => Restaurant, (restaurant) => restaurant.cuisines)
  restaurants!: Restaurant[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
