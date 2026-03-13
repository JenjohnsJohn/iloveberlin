import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { User } from '../users/entities/user.entity';
import { Article } from '../articles/entities/article.entity';
import { Event } from '../events/entities/event.entity';
import { Restaurant } from '../dining/entities/restaurant.entity';
import { Video } from '../videos/entities/video.entity';
import { Competition, CompetitionStatus } from '../competitions/entities/competition.entity';
import { PageView } from '../analytics/entities/page-view.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
    @InjectRepository(PageView)
    private readonly pageViewRepository: Repository<PageView>,
  ) {}

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalArticles: number;
    totalEvents: number;
    totalRestaurants: number;
    totalVideos: number;
    pageViewsToday: number;
    activeCompetitions: number;
  }> {
    const [
      totalUsers,
      totalArticles,
      totalEvents,
      totalRestaurants,
      totalVideos,
      activeCompetitions,
      pageViewsToday,
    ] = await Promise.all([
      this.userRepository.count(),
      this.articleRepository.count(),
      this.eventRepository.count(),
      this.restaurantRepository.count(),
      this.videoRepository.count(),
      this.competitionRepository.count({ where: { status: CompetitionStatus.ACTIVE } }),
      this.pageViewRepository
        .createQueryBuilder('pv')
        .where('pv.created_at >= CURRENT_DATE')
        .getCount(),
    ]);

    return {
      totalUsers,
      totalArticles,
      totalEvents,
      totalRestaurants,
      totalVideos,
      pageViewsToday,
      activeCompetitions,
    };
  }

  async getContentGrowth(days: number): Promise<{ date: string; count: number }[]> {
    const results = await this.articleRepository
      .createQueryBuilder('a')
      .select("TO_CHAR(DATE(a.created_at), 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where("a.created_at >= CURRENT_DATE - :days * INTERVAL '1 day'", { days })
      .groupBy('DATE(a.created_at)')
      .orderBy('DATE(a.created_at)', 'ASC')
      .getRawMany();

    return results.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getUserGrowth(days: number): Promise<{ date: string; count: number }[]> {
    const results = await this.userRepository
      .createQueryBuilder('u')
      .select("TO_CHAR(DATE(u.created_at), 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where("u.created_at >= CURRENT_DATE - :days * INTERVAL '1 day'", { days })
      .groupBy('DATE(u.created_at)')
      .orderBy('DATE(u.created_at)', 'ASC')
      .getRawMany();

    return results.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getPopularContent(): Promise<
    { id: string; title: string; type: string; views: number; date: string }[]
  > {
    const [articles, events, videos] = await Promise.all([
      this.articleRepository.find({
        select: ['id', 'title', 'view_count', 'created_at'],
        order: { view_count: 'DESC' },
        take: 5,
      }),
      this.eventRepository.find({
        select: ['id', 'title', 'view_count', 'created_at'],
        order: { view_count: 'DESC' },
        take: 3,
      }),
      this.videoRepository.find({
        select: ['id', 'title', 'view_count', 'created_at'],
        order: { view_count: 'DESC' },
        take: 2,
      }),
    ]);

    const combined = [
      ...articles.map((a) => ({
        id: a.id,
        title: a.title,
        type: 'article',
        views: a.view_count,
        date: a.created_at instanceof Date ? a.created_at.toISOString().split('T')[0] : String(a.created_at).split('T')[0],
      })),
      ...events.map((e) => ({
        id: e.id,
        title: e.title,
        type: 'event',
        views: e.view_count,
        date: e.created_at instanceof Date ? e.created_at.toISOString().split('T')[0] : String(e.created_at).split('T')[0],
      })),
      ...videos.map((v) => ({
        id: v.id,
        title: v.title,
        type: 'video',
        views: v.view_count,
        date: v.created_at instanceof Date ? v.created_at.toISOString().split('T')[0] : String(v.created_at).split('T')[0],
      })),
    ];

    return combined.sort((a, b) => b.views - a.views).slice(0, 10);
  }

  async getActivityLog(
    page: number,
    limit: number,
  ): Promise<{
    data: { id: string; user: string; action: string; entityType: string; entityId: string | null; timestamp: string }[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [logs, total] = await this.activityLogRepository.findAndCount({
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: logs.map((log) => ({
        id: log.id,
        user: log.user?.display_name || 'Unknown',
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        timestamp: log.created_at.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || null,
      ip_address: ipAddress || null,
    });
    return this.activityLogRepository.save(log);
  }
}
