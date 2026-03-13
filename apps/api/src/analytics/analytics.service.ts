import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageView } from './entities/page-view.entity';
import { AnalyticsDaily } from './entities/analytics-daily.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(PageView)
    private readonly pageViewRepository: Repository<PageView>,
    @InjectRepository(AnalyticsDaily)
    private readonly analyticsDailyRepository: Repository<AnalyticsDaily>,
  ) {}

  // ─── Track Page View ─────────────────────────────────────────

  async trackPageView(
    path: string,
    userId?: string,
    sessionId?: string,
    referrer?: string,
    userAgent?: string,
    ip?: string,
  ): Promise<PageView> {
    this.logger.log(`Page view tracked: ${path} (user: ${userId || 'anonymous'})`);

    const pageView = this.pageViewRepository.create({
      path,
      user_id: userId || null,
      session_id: sessionId || null,
      referrer: referrer || null,
      user_agent: userAgent || null,
      ip_address: ip || null,
    });

    return this.pageViewRepository.save(pageView);
  }

  // ─── Daily Stats ─────────────────────────────────────────────

  async getDailyStats(
    startDate: string,
    endDate: string,
  ): Promise<AnalyticsDaily[]> {
    this.logger.log(`Fetching daily stats from ${startDate} to ${endDate}`);

    // Try pre-aggregated analytics_daily table first
    const dailyStats = await this.analyticsDailyRepository
      .createQueryBuilder('ad')
      .where('ad.date >= :startDate AND ad.date <= :endDate', { startDate, endDate })
      .orderBy('ad.date', 'ASC')
      .getMany();

    if (dailyStats.length > 0) {
      return dailyStats;
    }

    // Fallback: aggregate from page_views in real time
    const rawStats = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select("TO_CHAR(DATE(pv.created_at), 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::int', 'page_views')
      .addSelect('COUNT(DISTINCT COALESCE(pv.user_id::text, pv.session_id))::int', 'unique_visitors')
      .where('DATE(pv.created_at) >= :startDate AND DATE(pv.created_at) <= :endDate', { startDate, endDate })
      .groupBy('DATE(pv.created_at)')
      .orderBy('DATE(pv.created_at)', 'ASC')
      .getRawMany();

    return rawStats.map((r) => ({
      id: '',
      date: r.date,
      page_views: Number(r.page_views),
      unique_visitors: Number(r.unique_visitors),
      new_users: 0,
      articles_published: 0,
      events_created: 0,
      search_queries: 0,
      created_at: new Date(),
    } as AnalyticsDaily));
  }

  // ─── Top Pages ───────────────────────────────────────────────

  async getTopPages(
    days: number = 30,
  ): Promise<{ path: string; views: number; unique_visitors: number }[]> {
    this.logger.log(`Fetching top pages for last ${days} days`);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select('pv.path', 'path')
      .addSelect('COUNT(*)::int', 'views')
      .addSelect('COUNT(DISTINCT COALESCE(pv.user_id::text, pv.session_id))::int', 'unique_visitors')
      .where('pv.created_at >= :since', { since })
      .groupBy('pv.path')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();

    return results.map((r) => ({
      path: r.path,
      views: Number(r.views),
      unique_visitors: Number(r.unique_visitors),
    }));
  }

  // ─── Traffic Sources ─────────────────────────────────────────

  async getTrafficSources(
    days: number = 30,
  ): Promise<{ source: string; visits: number; percentage: number }[]> {
    this.logger.log(`Fetching traffic sources for last ${days} days`);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const total = await this.pageViewRepository
      .createQueryBuilder('pv')
      .where('pv.created_at >= :since', { since })
      .getCount();

    if (total === 0) {
      return [];
    }

    const results = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select(`CASE
        WHEN pv.referrer IS NULL OR pv.referrer = '' THEN 'Direct'
        WHEN pv.referrer ILIKE '%google%' THEN 'Google'
        WHEN pv.referrer ILIKE '%instagram%' THEN 'Instagram'
        WHEN pv.referrer ILIKE '%facebook%' THEN 'Facebook'
        WHEN pv.referrer ILIKE '%twitter%' OR pv.referrer ILIKE '%x.com%' THEN 'Twitter/X'
        ELSE 'Other'
      END`, 'source')
      .addSelect('COUNT(*)::int', 'visits')
      .where('pv.created_at >= :since', { since })
      .groupBy('source')
      .orderBy('visits', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      source: r.source,
      visits: Number(r.visits),
      percentage: Math.round((Number(r.visits) / total) * 1000) / 10,
    }));
  }

  // ─── Search Trends ───────────────────────────────────────────

  async getSearchTrends(
    days: number = 30,
  ): Promise<{ term: string; count: number; trend: string }[]> {
    this.logger.log(`Fetching search trends for last ${days} days`);

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Derive search terms from page_views where path contains search queries
    const results = await this.pageViewRepository
      .createQueryBuilder('pv')
      .select('pv.path', 'path')
      .addSelect('COUNT(*)::int', 'count')
      .where('pv.created_at >= :since', { since })
      .andWhere("pv.path LIKE :prefix", { prefix: '/search%' })
      .groupBy('pv.path')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return results
      .map((r) => {
        try {
          const url = new URL(r.path, 'http://localhost');
          const term = url.searchParams.get('q') || r.path.replace('/search', '').replace('?', '');
          return {
            term: decodeURIComponent(term),
            count: Number(r.count),
            trend: 'stable',
          };
        } catch {
          return {
            term: r.path,
            count: Number(r.count),
            trend: 'stable',
          };
        }
      })
      .filter((r) => r.term.length > 0);
  }
}
