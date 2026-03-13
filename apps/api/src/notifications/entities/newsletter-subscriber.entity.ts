import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'boolean', default: false })
  is_confirmed!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  confirmation_token!: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  subscribed_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  unsubscribed_at!: Date | null;
}
