import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { AdminNewsletterQueryDto, SubscriberStatus } from './dto/admin-newsletter-query.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NewsletterSubscriber)
    private readonly subscriberRepository: Repository<NewsletterSubscriber>,
  ) {}

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { user_id: userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({ user_id: userId });
      preferences = await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<NotificationPreference> {
    let preferences = await this.getPreferences(userId);
    Object.assign(preferences, dto);
    preferences = await this.preferenceRepository.save(preferences);
    return preferences;
  }

  async subscribeNewsletter(
    email: string,
  ): Promise<{ message: string }> {
    const existing = await this.subscriberRepository.findOne({
      where: { email },
    });

    if (existing) {
      if (existing.is_confirmed && !existing.unsubscribed_at) {
        return { message: 'You are already subscribed to our newsletter.' };
      }

      // Re-subscribe or resend confirmation
      existing.unsubscribed_at = null;
      existing.confirmation_token = randomUUID();
      existing.is_confirmed = false;
      await this.subscriberRepository.save(existing);

      this.sendEmail(
        email,
        'Confirm your ILoveBerlin newsletter subscription',
        'newsletter-confirmation',
        { token: existing.confirmation_token },
      );

      return { message: 'Please check your email to confirm your subscription.' };
    }

    const confirmationToken = randomUUID();
    const subscriber = this.subscriberRepository.create({
      email,
      confirmation_token: confirmationToken,
    });
    await this.subscriberRepository.save(subscriber);

    this.sendEmail(
      email,
      'Confirm your ILoveBerlin newsletter subscription',
      'newsletter-confirmation',
      { token: confirmationToken },
    );

    return { message: 'Please check your email to confirm your subscription.' };
  }

  async confirmNewsletter(token: string): Promise<{ message: string }> {
    const subscriber = await this.subscriberRepository.findOne({
      where: { confirmation_token: token },
    });

    if (!subscriber) {
      throw new NotFoundException('Invalid or expired confirmation token.');
    }

    subscriber.is_confirmed = true;
    subscriber.confirmation_token = null;
    subscriber.unsubscribed_at = null;
    await this.subscriberRepository.save(subscriber);

    return { message: 'Your newsletter subscription has been confirmed!' };
  }

  async unsubscribe(email: string): Promise<{ message: string }> {
    const subscriber = await this.subscriberRepository.findOne({
      where: { email },
    });

    if (!subscriber) {
      throw new NotFoundException('Email not found in our subscriber list.');
    }

    subscriber.unsubscribed_at = new Date();
    await this.subscriberRepository.save(subscriber);

    return { message: 'You have been unsubscribed from our newsletter.' };
  }

  sendEmail(
    to: string,
    subject: string,
    template: string,
    data?: Record<string, unknown>,
  ): void {
    this.logger.log('========================================');
    this.logger.log(`[EMAIL] To: ${to}, Subject: ${subject}, Template: ${template}`);
    if (data) {
      this.logger.log(`[EMAIL] Data: ${JSON.stringify(data)}`);
    }
    this.logger.log('========================================');
  }

  sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): void {
    this.logger.log('========================================');
    this.logger.log(`[PUSH] To: ${userId}, Title: ${title}`);
    this.logger.log(`[PUSH] Body: ${body}`);
    if (data) {
      this.logger.log(`[PUSH] Data: ${JSON.stringify(data)}`);
    }
    this.logger.log('========================================');
  }

  // ─── Admin Newsletter Methods ────────────────────────────────

  async getSubscriberList(query: AdminNewsletterQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.subscriberRepository.createQueryBuilder('s');

    if (query.status && query.status !== SubscriberStatus.ALL) {
      switch (query.status) {
        case SubscriberStatus.CONFIRMED:
          qb.andWhere('s.is_confirmed = true').andWhere('s.unsubscribed_at IS NULL');
          break;
        case SubscriberStatus.UNCONFIRMED:
          qb.andWhere('s.is_confirmed = false').andWhere('s.unsubscribed_at IS NULL');
          break;
        case SubscriberStatus.UNSUBSCRIBED:
          qb.andWhere('s.unsubscribed_at IS NOT NULL');
          break;
      }
    }

    if (query.search) {
      qb.andWhere('s.email ILIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy('s.subscribed_at', 'DESC');
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getSubscriberStats() {
    const total = await this.subscriberRepository.count();
    const confirmed = await this.subscriberRepository.count({
      where: { is_confirmed: true },
    });
    const unsubscribed = await this.subscriberRepository
      .createQueryBuilder('s')
      .where('s.unsubscribed_at IS NOT NULL')
      .getCount();
    const unconfirmed = total - confirmed - unsubscribed;

    return { total, confirmed, unconfirmed, unsubscribed };
  }

  async exportSubscribers(status?: SubscriberStatus) {
    const qb = this.subscriberRepository.createQueryBuilder('s');

    if (status && status !== SubscriberStatus.ALL) {
      switch (status) {
        case SubscriberStatus.CONFIRMED:
          qb.andWhere('s.is_confirmed = true').andWhere('s.unsubscribed_at IS NULL');
          break;
        case SubscriberStatus.UNCONFIRMED:
          qb.andWhere('s.is_confirmed = false').andWhere('s.unsubscribed_at IS NULL');
          break;
        case SubscriberStatus.UNSUBSCRIBED:
          qb.andWhere('s.unsubscribed_at IS NOT NULL');
          break;
      }
    }

    qb.orderBy('s.subscribed_at', 'DESC');
    return qb.getMany();
  }

  async removeSubscriber(id: string) {
    const subscriber = await this.subscriberRepository.findOne({
      where: { id },
    });
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }
    await this.subscriberRepository.remove(subscriber);
    return { message: 'Subscriber removed successfully' };
  }
}
