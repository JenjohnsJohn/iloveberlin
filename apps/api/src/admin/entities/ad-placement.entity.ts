import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AdCampaign } from './ad-campaign.entity';

export enum AdPosition {
  HOMEPAGE_BANNER = 'homepage_banner',
  SIDEBAR = 'sidebar',
  ARTICLE_INLINE = 'article_inline',
  CATEGORY_HEADER = 'category_header',
  FOOTER = 'footer',
}

@Entity('ad_placements')
export class AdPlacement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  campaign_id!: string;

  @ManyToOne(() => AdCampaign, (campaign) => campaign.placements, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: AdCampaign;

  @Column({
    type: 'enum',
    enum: AdPosition,
  })
  position!: AdPosition;

  @Column({ type: 'varchar', length: 500 })
  image_url!: string;

  @Column({ type: 'varchar', length: 500 })
  link_url!: string;

  @Column({ type: 'varchar', length: 255 })
  alt_text!: string;

  @Column({ type: 'int', default: 0 })
  impressions!: number;

  @Column({ type: 'int', default: 0 })
  clicks!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
