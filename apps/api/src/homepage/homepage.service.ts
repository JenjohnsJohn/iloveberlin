import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HomepageFeatured } from './entities/homepage-featured.entity';

export interface ResolvedHomepageItem {
  id: string;
  content_type: string;
  content_id: string;
  sort_order: number;
  title: string;
  slug: string;
  image_url: string | null;
  excerpt: string | null;
  category_name: string | null;
  category_slug: string | null;
  extra: Record<string, unknown>;
}

export interface HomepageData {
  hero: ResolvedHomepageItem[];
  trending: ResolvedHomepageItem[];
  events: ResolvedHomepageItem[];
  weekend: ResolvedHomepageItem[];
  dining: ResolvedHomepageItem[];
  videos: ResolvedHomepageItem[];
  competitions: ResolvedHomepageItem[];
  classifieds: ResolvedHomepageItem[];
}

@Injectable()
export class HomepageService {
  private readonly logger = new Logger(HomepageService.name);

  constructor(
    @InjectRepository(HomepageFeatured)
    private readonly featuredRepository: Repository<HomepageFeatured>,
    private readonly dataSource: DataSource,
  ) {}

  async getHomepageData(): Promise<HomepageData> {
    const allFeatured = await this.featuredRepository.find({
      order: { section: 'ASC', sort_order: 'ASC' },
    });

    const resolved = await this.resolveContent(allFeatured);

    const sections: HomepageData = {
      hero: [],
      trending: [],
      events: [],
      weekend: [],
      dining: [],
      videos: [],
      competitions: [],
      classifieds: [],
    };

    for (const item of allFeatured) {
      const sectionKey = item.section as keyof HomepageData;
      if (!sections[sectionKey]) continue;

      const content = resolved.get(item.content_id);
      if (!content) continue; // deleted or not found — silently skip

      sections[sectionKey].push({
        id: item.id,
        content_type: item.content_type,
        content_id: item.content_id,
        sort_order: item.sort_order,
        ...content,
      });
    }

    return sections;
  }

  private async resolveContent(
    items: HomepageFeatured[],
  ): Promise<Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>> {
    const result = new Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>();

    // Group items by content_type
    const groups = new Map<string, string[]>();
    for (const item of items) {
      const ids = groups.get(item.content_type) ?? [];
      ids.push(item.content_id);
      groups.set(item.content_type, ids);
    }

    const resolvers: Record<string, (ids: string[]) => Promise<void>> = {
      article: (ids) => this.resolveArticles(ids, result),
      event: (ids) => this.resolveEvents(ids, result),
      restaurant: (ids) => this.resolveRestaurants(ids, result),
      video: (ids) => this.resolveVideos(ids, result),
      competition: (ids) => this.resolveCompetitions(ids, result),
      classified: (ids) => this.resolveClassifieds(ids, result),
      guide: (ids) => this.resolveGuides(ids, result),
      product: (ids) => this.resolveProducts(ids, result),
    };

    const promises: Promise<void>[] = [];
    for (const [contentType, ids] of groups) {
      const resolver = resolvers[contentType];
      if (resolver) {
        promises.push(resolver(ids));
      } else {
        this.logger.warn(`Unknown content_type "${contentType}" — skipping resolution`);
      }
    }

    await Promise.all(promises);
    return result;
  }

  private async resolveArticles(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT a.id, a.title, a.slug, a.excerpt,
              a.published_at, a.read_time_minutes,
              m.url AS image_url,
              c.name AS category_name, c.slug AS category_slug,
              u.display_name AS author_name, u.avatar_url AS author_avatar_url
       FROM articles a
       LEFT JOIN media m ON m.id = a.featured_image_id
       LEFT JOIN categories c ON c.id = a.category_id
       LEFT JOIN users u ON u.id = a.author_id
       WHERE a.id = ANY($1) AND a.deleted_at IS NULL`,
      [ids],
    );
    for (const row of rows) {
      result.set(row.id, {
        title: row.title,
        slug: row.slug,
        image_url: row.image_url ?? null,
        excerpt: row.excerpt ?? null,
        category_name: row.category_name ?? null,
        category_slug: row.category_slug ?? null,
        extra: {
          published_at: row.published_at,
          read_time_minutes: row.read_time_minutes,
          author_name: row.author_name,
          author_avatar_url: row.author_avatar_url,
        },
      });
    }
  }

  private async resolveEvents(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT e.id, e.title, e.slug, e.excerpt,
              e.start_date, e.start_time, e.end_time,
              e.is_free, e.price, e.price_max,
              m.url AS image_url,
              c.name AS category_name, c.slug AS category_slug,
              v.name AS venue_name
       FROM events e
       LEFT JOIN media m ON m.id = e.featured_image_id
       LEFT JOIN categories c ON c.id = e.category_id
       LEFT JOIN venues v ON v.id = e.venue_id
       WHERE e.id = ANY($1) AND e.deleted_at IS NULL`,
      [ids],
    );
    for (const row of rows) {
      result.set(row.id, {
        title: row.title,
        slug: row.slug,
        image_url: row.image_url ?? null,
        excerpt: row.excerpt ?? null,
        category_name: row.category_name ?? null,
        category_slug: row.category_slug ?? null,
        extra: {
          start_date: row.start_date,
          start_time: row.start_time,
          end_time: row.end_time,
          is_free: row.is_free,
          price: row.price,
          price_max: row.price_max,
          venue_name: row.venue_name,
        },
      });
    }
  }

  private async resolveRestaurants(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT r.id, r.name, r.slug, r.description,
              r.district, r.price_range, r.rating,
              m.url AS image_url
       FROM restaurants r
       LEFT JOIN media m ON m.id = r.featured_image_id
       WHERE r.id = ANY($1) AND r.deleted_at IS NULL`,
      [ids],
    );

    // Batch fetch cuisines for all restaurants
    const cuisineRows = ids.length > 0
      ? await this.dataSource.query(
          `SELECT rc.restaurant_id, cu.name, cu.slug
           FROM restaurant_cuisines rc
           JOIN cuisines cu ON cu.id = rc.cuisine_id
           WHERE rc.restaurant_id = ANY($1)`,
          [ids],
        )
      : [];

    const cuisineMap = new Map<string, { name: string; slug: string }[]>();
    for (const cr of cuisineRows) {
      const list = cuisineMap.get(cr.restaurant_id) ?? [];
      list.push({ name: cr.name, slug: cr.slug });
      cuisineMap.set(cr.restaurant_id, list);
    }

    for (const row of rows) {
      const cuisines = cuisineMap.get(row.id) ?? [];
      result.set(row.id, {
        title: row.name,
        slug: row.slug,
        image_url: row.image_url ?? null,
        excerpt: row.description ?? null,
        category_name: cuisines[0]?.name ?? null,
        category_slug: cuisines[0]?.slug ?? null,
        extra: {
          district: row.district,
          price_range: row.price_range,
          rating: row.rating,
          cuisines: cuisines.map((c) => c.name),
          cuisine_slugs: cuisines.map((c) => c.slug),
        },
      });
    }
  }

  private async resolveVideos(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT v.id, v.title, v.slug, v.description,
              v.video_url, v.video_provider, v.duration_seconds, v.published_at,
              m.url AS image_url,
              c.name AS category_name, c.slug AS category_slug,
              vs.name AS series_name, vs.slug AS series_slug
       FROM videos v
       LEFT JOIN media m ON m.id = v.thumbnail_id
       LEFT JOIN categories c ON c.id = v.category_id
       LEFT JOIN video_series vs ON vs.id = v.series_id
       WHERE v.id = ANY($1) AND v.deleted_at IS NULL`,
      [ids],
    );
    for (const row of rows) {
      result.set(row.id, {
        title: row.title,
        slug: row.slug,
        image_url: row.image_url ?? null,
        excerpt: row.description ?? null,
        category_name: row.category_name ?? null,
        category_slug: row.category_slug ?? null,
        extra: {
          video_url: row.video_url,
          video_provider: row.video_provider,
          duration_seconds: row.duration_seconds,
          published_at: row.published_at,
          series_name: row.series_name,
          series_slug: row.series_slug,
        },
      });
    }
  }

  private async resolveCompetitions(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT co.id, co.title, co.slug, co.description,
              co.end_date, co.prize_description, co.status,
              m.url AS image_url,
              c.name AS category_name, c.slug AS category_slug
       FROM competitions co
       LEFT JOIN media m ON m.id = co.featured_image_id
       LEFT JOIN categories c ON c.id = co.category_id
       WHERE co.id = ANY($1) AND co.deleted_at IS NULL`,
      [ids],
    );
    for (const row of rows) {
      result.set(row.id, {
        title: row.title,
        slug: row.slug,
        image_url: row.image_url ?? null,
        excerpt: row.description ?? null,
        category_name: row.category_name ?? null,
        category_slug: row.category_slug ?? null,
        extra: {
          end_date: row.end_date,
          prize_description: row.prize_description,
          status: row.status,
        },
      });
    }
  }

  private async resolveClassifieds(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT cl.id, cl.title, cl.slug, cl.description,
              cl.price, cl.price_type, cl.location, cl.condition, cl.featured,
              cc.name AS category_name, cc.slug AS category_slug
       FROM classifieds cl
       LEFT JOIN classified_categories cc ON cc.id = cl.category_id
       WHERE cl.id = ANY($1) AND cl.deleted_at IS NULL`,
      [ids],
    );

    // Batch fetch first image per classified
    const imageRows = ids.length > 0
      ? await this.dataSource.query(
          `SELECT DISTINCT ON (ci.classified_id) ci.classified_id, ci.url
           FROM classified_images ci
           WHERE ci.classified_id = ANY($1)
           ORDER BY ci.classified_id, ci.sort_order ASC`,
          [ids],
        )
      : [];

    const imageMap = new Map<string, string>();
    for (const ir of imageRows) {
      imageMap.set(ir.classified_id, ir.url);
    }

    for (const row of rows) {
      result.set(row.id, {
        title: row.title,
        slug: row.slug,
        image_url: imageMap.get(row.id) ?? null,
        excerpt: row.description ?? null,
        category_name: row.category_name ?? null,
        category_slug: row.category_slug ?? null,
        extra: {
          price: row.price,
          price_type: row.price_type,
          location: row.location,
          condition: row.condition,
          featured: row.featured,
        },
      });
    }
  }

  private async resolveGuides(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT g.id, g.title, g.slug, g.excerpt,
              m.url AS image_url,
              gt.name AS topic_name, gt.slug AS topic_slug,
              u.display_name AS author_name
       FROM guides g
       LEFT JOIN media m ON m.id = g.featured_image_id
       LEFT JOIN guide_topics gt ON gt.id = g.topic_id
       LEFT JOIN users u ON u.id = g.author_id
       WHERE g.id = ANY($1) AND g.deleted_at IS NULL`,
      [ids],
    );
    for (const row of rows) {
      result.set(row.id, {
        title: row.title,
        slug: row.slug,
        image_url: row.image_url ?? null,
        excerpt: row.excerpt ?? null,
        category_name: row.topic_name ?? null,
        category_slug: row.topic_slug ?? null,
        extra: {
          author_name: row.author_name,
          topic_slug: row.topic_slug,
        },
      });
    }
  }

  private async resolveProducts(
    ids: string[],
    result: Map<string, Omit<ResolvedHomepageItem, 'id' | 'content_type' | 'content_id' | 'sort_order'>>,
  ): Promise<void> {
    const rows = await this.dataSource.query(
      `SELECT p.id, p.name, p.slug, p.short_description,
              p.base_price, p.compare_at_price, p.is_featured,
              pc.name AS category_name, pc.slug AS category_slug
       FROM products p
       LEFT JOIN product_categories pc ON pc.id = p.category_id
       WHERE p.id = ANY($1) AND p.deleted_at IS NULL`,
      [ids],
    );

    // Batch fetch primary images
    const imageRows = ids.length > 0
      ? await this.dataSource.query(
          `SELECT pi.product_id, pi.url
           FROM product_images pi
           WHERE pi.product_id = ANY($1) AND pi.is_primary = true`,
          [ids],
        )
      : [];

    const imageMap = new Map<string, string>();
    for (const ir of imageRows) {
      imageMap.set(ir.product_id, ir.url);
    }

    for (const row of rows) {
      result.set(row.id, {
        title: row.name,
        slug: row.slug,
        image_url: imageMap.get(row.id) ?? null,
        excerpt: row.short_description ?? null,
        category_name: row.category_name ?? null,
        category_slug: row.category_slug ?? null,
        extra: {
          base_price: row.base_price,
          compare_at_price: row.compare_at_price,
          is_featured: row.is_featured,
        },
      });
    }
  }

  async getSectionItems(section: string): Promise<HomepageFeatured[]> {
    return this.featuredRepository.find({
      where: { section },
      order: { sort_order: 'ASC' },
    });
  }

  async addFeaturedItem(
    section: string,
    contentType: string,
    contentId: string,
    sortOrder = 0,
  ): Promise<HomepageFeatured> {
    const item = this.featuredRepository.create({
      section,
      content_type: contentType,
      content_id: contentId,
      sort_order: sortOrder,
    });

    return this.featuredRepository.save(item);
  }

  async updateSectionItems(
    section: string,
    items: Array<{ content_type: string; content_id: string; sort_order: number }>,
  ): Promise<HomepageFeatured[]> {
    // Remove existing items for this section
    await this.featuredRepository.delete({ section });

    // Insert new items
    const newItems = items.map((item) =>
      this.featuredRepository.create({
        section,
        content_type: item.content_type,
        content_id: item.content_id,
        sort_order: item.sort_order,
      }),
    );

    return this.featuredRepository.save(newItems);
  }

  async removeFeaturedItem(id: string): Promise<void> {
    const item = await this.featuredRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Homepage featured item with id "${id}" not found`);
    }

    await this.featuredRepository.remove(item);
  }
}
