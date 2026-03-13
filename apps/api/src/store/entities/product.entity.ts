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
import { ProductCategory } from './product-category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  category_id!: string | null;

  @ManyToOne(() => ProductCategory, (cat) => cat.products, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  @JoinColumn({ name: 'category_id' })
  category!: ProductCategory | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  short_description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compare_at_price!: number | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku!: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status!: ProductStatus;

  @Column({ type: 'boolean', default: false })
  is_featured!: boolean;

  @Column({ type: 'boolean', default: false })
  is_digital!: boolean;

  @Column({ type: 'int', default: 0 })
  stock_quantity!: number;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title!: string | null;

  @Column({ type: 'text', nullable: true })
  meta_description!: string | null;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { eager: false })
  variants!: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, { eager: false })
  images!: ProductImage[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at!: Date | null;
}
