import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeiliSearch, Index } from 'meilisearch';
import { SearchContentType } from './dto/search-query.dto';
import { SearchResultDto, SuggestResultDto, SearchHit } from './dto/search-result.dto';
import { Article } from '../articles/entities/article.entity';
import { Guide } from '../guides/entities/guide.entity';
import { Event } from '../events/entities/event.entity';
import { Restaurant } from '../dining/entities/restaurant.entity';
import { Video } from '../videos/entities/video.entity';
import { Classified } from '../classifieds/entities/classified.entity';
import { Product } from '../store/entities/product.entity';

interface IndexConfig {
  searchableAttributes: string[];
  filterableAttributes: string[];
  sortableAttributes: string[];
}

const INDEX_CONFIGS: Record<string, IndexConfig> = {
  articles: {
    searchableAttributes: ['title', 'body', 'excerpt', 'description'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
  guides: {
    searchableAttributes: ['title', 'body', 'description', 'summary'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
  events: {
    searchableAttributes: ['title', 'description', 'venue', 'body'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
  restaurants: {
    searchableAttributes: ['title', 'name', 'description', 'cuisine'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
  videos: {
    searchableAttributes: ['title', 'description', 'body'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
  classifieds: {
    searchableAttributes: ['title', 'description', 'body'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
  products: {
    searchableAttributes: ['title', 'name', 'description', 'body'],
    filterableAttributes: ['category', 'status', 'district'],
    sortableAttributes: ['created_at', 'views'],
  },
};

const BATCH_SIZE = 500;

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Classified)
    private readonly classifiedRepository: Repository<Classified>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    const host = this.configService.get<string>('MEILISEARCH_HOST', 'http://localhost:7700');
    const apiKey = this.configService.get<string>('MEILISEARCH_API_KEY', 'iloveberlin-dev-key');

    this.client = new MeiliSearch({ host, apiKey });
  }

  async onModuleInit() {
    try {
      const health = await this.client.health();
      this.logger.log(`Meilisearch connected - status: ${health.status}`);
      await this.configureIndexes();
    } catch (error) {
      this.logger.warn(
        'Meilisearch is not available. Search features will be limited. ' +
        'Start Meilisearch with: docker compose up meilisearch',
      );
    }
  }

  private async configureIndexes(): Promise<void> {
    for (const [indexName, config] of Object.entries(INDEX_CONFIGS)) {
      try {
        const index = await this.getOrCreateIndex(indexName);
        await index.updateSearchableAttributes(config.searchableAttributes);
        await index.updateFilterableAttributes(config.filterableAttributes);
        await index.updateSortableAttributes(config.sortableAttributes);
        this.logger.log(`Configured index: ${indexName}`);
      } catch (error) {
        this.logger.warn(`Failed to configure index "${indexName}": ${error}`);
      }
    }
  }

  private async getOrCreateIndex(indexName: string): Promise<Index> {
    try {
      return await this.client.getIndex(indexName);
    } catch {
      await this.client.createIndex(indexName, { primaryKey: 'id' });
      return this.client.getIndex(indexName);
    }
  }

  async search(
    query: string,
    options: { type?: SearchContentType; page?: number; limit?: number } = {},
  ): Promise<SearchResultDto> {
    const { type, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    try {
      if (type) {
        // Search a single index
        const index = this.client.index(type);
        const result = await index.search(query, {
          limit,
          offset,
        });

        const hits: SearchHit[] = result.hits.map((hit) => ({
          id: hit.id as string,
          type,
          title: (hit.title || hit.name || '') as string,
          description: (hit.description || hit.excerpt || hit.summary || '') as string,
          slug: (hit.slug || '') as string,
          category: hit.category as string | undefined,
          district: hit.district as string | undefined,
          status: hit.status as string | undefined,
          created_at: hit.created_at as string | undefined,
          views: hit.views as number | undefined,
        }));

        return {
          hits,
          total: result.estimatedTotalHits || 0,
          page,
          limit,
          type,
          query,
          processingTimeMs: result.processingTimeMs,
        };
      }

      // Search across all indexes (multi-search)
      const indexNames = Object.keys(INDEX_CONFIGS);
      const queries = indexNames.map((indexName) => ({
        indexUid: indexName,
        q: query,
        limit: Math.ceil(limit / indexNames.length),
        offset: 0,
      }));

      const multiResult = await this.client.multiSearch({ queries });

      const allHits: SearchHit[] = [];
      let totalEstimate = 0;

      for (const result of multiResult.results) {
        const indexType = result.indexUid;
        for (const hit of result.hits) {
          allHits.push({
            id: hit.id as string,
            type: indexType,
            title: (hit.title || hit.name || '') as string,
            description: (hit.description || hit.excerpt || hit.summary || '') as string,
            slug: (hit.slug || '') as string,
            category: hit.category as string | undefined,
            district: hit.district as string | undefined,
            status: hit.status as string | undefined,
            created_at: hit.created_at as string | undefined,
            views: hit.views as number | undefined,
          });
        }
        totalEstimate += result.estimatedTotalHits || 0;
      }

      // Paginate the combined results
      const paginatedHits = allHits.slice(0, limit);
      const processingTimeMs = Math.max(
        ...multiResult.results.map((r) => r.processingTimeMs),
      );

      return {
        hits: paginatedHits,
        total: totalEstimate,
        page,
        limit,
        query,
        processingTimeMs,
      };
    } catch (error) {
      this.logger.error(
        `Search failed for query "${query}" (type=${type || 'all'}, page=${page}, limit=${limit})`,
        error instanceof Error ? error.stack : String(error),
      );
      return {
        hits: [],
        total: 0,
        page,
        limit,
        query,
        processingTimeMs: 0,
      };
    }
  }

  async suggest(query: string): Promise<SuggestResultDto> {
    try {
      const indexNames = Object.keys(INDEX_CONFIGS);
      const queries = indexNames.map((indexName) => ({
        indexUid: indexName,
        q: query,
        limit: 2,
        attributesToRetrieve: ['title', 'name', 'slug'],
      }));

      const multiResult = await this.client.multiSearch({ queries });

      const suggestions: SuggestResultDto['suggestions'] = [];

      for (const result of multiResult.results) {
        for (const hit of result.hits) {
          suggestions.push({
            title: (hit.title || hit.name || '') as string,
            type: result.indexUid,
            slug: (hit.slug || '') as string,
          });
        }
      }

      // Return max 8 suggestions
      return {
        suggestions: suggestions.slice(0, 8),
        query,
      };
    } catch (error) {
      this.logger.error(
        `Suggest failed for query "${query}"`,
        error instanceof Error ? error.stack : String(error),
      );
      return {
        suggestions: [],
        query,
      };
    }
  }

  async indexDocument(type: string, document: Record<string, unknown>): Promise<void> {
    try {
      const index = this.client.index(type);
      await index.addDocuments([document]);
      this.logger.log(`Indexed document ${document.id} in ${type}`);
    } catch (error) {
      this.logger.error(`Failed to index document in ${type}: ${error}`);
    }
  }

  async removeDocument(type: string, id: string): Promise<void> {
    try {
      const index = this.client.index(type);
      await index.deleteDocument(id);
      this.logger.log(`Removed document ${id} from ${type}`);
    } catch (error) {
      this.logger.error(`Failed to remove document ${id} from ${type}: ${error}`);
    }
  }

  async rebuildIndex(type: string): Promise<void> {
    if (!INDEX_CONFIGS[type]) {
      throw new Error(`Unknown index type: ${type}`);
    }

    this.logger.log(`Rebuilding index: ${type}`);

    try {
      const index = await this.getOrCreateIndex(type);
      const config = INDEX_CONFIGS[type];
      await index.updateSearchableAttributes(config.searchableAttributes);
      await index.updateFilterableAttributes(config.filterableAttributes);
      await index.updateSortableAttributes(config.sortableAttributes);

      // Delete all existing documents before re-indexing
      await index.deleteAllDocuments();

      const documents = await this.fetchAllDocuments(type);
      if (documents.length === 0) {
        this.logger.log(`No documents found for index "${type}"`);
        return;
      }

      // Batch-index documents
      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        await index.addDocuments(batch);
        this.logger.log(`Indexed batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} docs) for "${type}"`);
      }

      this.logger.log(`Index "${type}" rebuilt with ${documents.length} documents`);
    } catch (error) {
      this.logger.error(`Failed to rebuild index "${type}": ${error}`);
    }
  }

  async rebuildAllIndexes(): Promise<void> {
    this.logger.log('Rebuilding all search indexes...');
    for (const type of Object.keys(INDEX_CONFIGS)) {
      await this.rebuildIndex(type);
    }
    this.logger.log('All search indexes rebuilt');
  }

  private async fetchAllDocuments(type: string): Promise<Record<string, unknown>[]> {
    switch (type) {
      case 'articles': {
        const items = await this.articleRepository.find({
          relations: ['category'],
        });
        return items.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          excerpt: a.excerpt,
          description: a.excerpt,
          slug: a.slug,
          category: a.category?.id,
          status: a.status,
          created_at: a.created_at?.toISOString(),
          views: a.view_count,
        }));
      }
      case 'guides': {
        const items = await this.guideRepository.find({
          relations: ['topic'],
        });
        return items.map((g) => ({
          id: g.id,
          title: g.title,
          body: g.body,
          description: g.excerpt,
          summary: g.excerpt,
          slug: g.slug,
          category: g.topic?.id,
          status: g.status,
          created_at: g.created_at?.toISOString(),
          views: 0,
        }));
      }
      case 'events': {
        const items = await this.eventRepository.find({
          relations: ['venue', 'category'],
        });
        return items.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          body: e.description,
          venue: e.venue?.id,
          slug: e.slug,
          category: e.category?.id,
          status: e.status,
          created_at: e.created_at?.toISOString(),
          views: e.view_count,
        }));
      }
      case 'restaurants': {
        const items = await this.restaurantRepository.find({
          relations: ['cuisines'],
        });
        return items.map((r) => ({
          id: r.id,
          title: r.name,
          name: r.name,
          description: r.description,
          cuisine: r.cuisines?.map((c) => c.name).join(', '),
          slug: r.slug,
          district: r.district,
          status: r.status,
          created_at: r.created_at?.toISOString(),
          views: 0,
        }));
      }
      case 'videos': {
        const items = await this.videoRepository.find({
          relations: ['category'],
        });
        return items.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          body: v.description,
          slug: v.slug,
          category: v.category?.id,
          status: v.status,
          created_at: v.created_at?.toISOString(),
          views: v.view_count,
        }));
      }
      case 'classifieds': {
        const items = await this.classifiedRepository.find({
          relations: ['category'],
        });
        return items.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          body: c.description,
          slug: c.slug,
          category: c.category?.id,
          district: c.district,
          status: c.status,
          created_at: c.created_at?.toISOString(),
          views: c.view_count,
        }));
      }
      case 'products': {
        const items = await this.productRepository.find({
          relations: ['category'],
        });
        return items.map((p) => ({
          id: p.id,
          title: p.name,
          name: p.name,
          description: p.description,
          body: p.description,
          slug: p.slug,
          category: p.category?.id,
          status: p.status,
          created_at: p.created_at?.toISOString(),
          views: 0,
        }));
      }
      default:
        return [];
    }
  }
}
