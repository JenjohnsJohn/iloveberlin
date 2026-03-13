import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('analytics_daily')
export class AnalyticsDaily {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date', unique: true })
  date!: string;

  @Column({ type: 'int', default: 0 })
  page_views!: number;

  @Column({ type: 'int', default: 0 })
  unique_visitors!: number;

  @Column({ type: 'int', default: 0 })
  new_users!: number;

  @Column({ type: 'int', default: 0 })
  articles_published!: number;

  @Column({ type: 'int', default: 0 })
  events_created!: number;

  @Column({ type: 'int', default: 0 })
  search_queries!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
