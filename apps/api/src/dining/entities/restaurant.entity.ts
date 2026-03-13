import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Media } from '../../media/entities/media.entity';
import { Cuisine } from './cuisine.entity';
import { RestaurantImage } from './restaurant-image.entity';
import { DiningOffer } from './dining-offer.entity';

export enum PriceRange {
  BUDGET = 'budget',
  MODERATE = 'moderate',
  UPSCALE = 'upscale',
  FINE_DINING = 'fine_dining',
}

export enum RestaurantStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({
    type: 'enum',
    enum: PriceRange,
    default: PriceRange.MODERATE,
  })
  price_range!: PriceRange;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating!: number | null;

  @Column({ type: 'jsonb', default: '{}' })
  opening_hours!: Record<string, unknown>;

  @Column({ type: 'uuid', nullable: true })
  featured_image_id!: string | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'featured_image_id' })
  featured_image!: Media | null;

  @Column({
    type: 'enum',
    enum: RestaurantStatus,
    default: RestaurantStatus.DRAFT,
  })
  status!: RestaurantStatus;

  @ManyToMany(() => Cuisine, (cuisine) => cuisine.restaurants, { eager: false })
  @JoinTable({
    name: 'restaurant_cuisines',
    joinColumn: { name: 'restaurant_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'cuisine_id', referencedColumnName: 'id' },
  })
  cuisines!: Cuisine[];

  @OneToMany(() => RestaurantImage, (image) => image.restaurant, { eager: false })
  images!: RestaurantImage[];

  @OneToMany(() => DiningOffer, (offer) => offer.restaurant, { eager: false })
  offers!: DiningOffer[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
