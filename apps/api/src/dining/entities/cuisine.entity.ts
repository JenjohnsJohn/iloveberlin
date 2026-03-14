import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @Column({ type: 'uuid', nullable: true })
  parent_id!: string | null;

  @ManyToOne(() => Cuisine, (cuisine) => cuisine.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Cuisine | null;

  @OneToMany(() => Cuisine, (cuisine) => cuisine.parent)
  children!: Cuisine[];

  @ManyToMany(() => Restaurant, (restaurant) => restaurant.cuisines)
  restaurants!: Restaurant[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
