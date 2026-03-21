/**
 * Redis service for the ILOVEBERLIN API.
 *
 * Provides a thin wrapper around ioredis with graceful fallback to an
 * in-memory Map when Redis is not configured or unavailable.  This lets
 * the application work identically in development (no Redis) and
 * production (Redis available).
 *
 * Prerequisites:
 *   npm install ioredis
 *   npm install -D @types/ioredis   (types are bundled with ioredis 5+)
 *
 * Environment variables:
 *   REDIS_URL  — full Redis connection string, e.g. redis://localhost:6379
 *                If not set, the service falls back to in-memory storage.
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ioredis may not be installed yet — import conditionally so the module
// can still load and fall back to in-memory storage.
let Redis: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Redis = require('ioredis');
} catch {
  Redis = null;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: any | null = null;
  private connected = false;

  /** In-memory fallback map: key -> expiry timestamp */
  private readonly fallbackMap = new Map<string, number>();
  private fallbackCleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (Redis && redisUrl) {
      try {
        this.client = new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 2000)),
          lazyConnect: true,
        });

        this.client.on('connect', () => {
          this.connected = true;
          this.logger.log('Connected to Redis');
        });

        this.client.on('error', (err: Error) => {
          this.connected = false;
          this.logger.warn(`Redis error (falling back to in-memory): ${err.message}`);
        });

        this.client.on('close', () => {
          this.connected = false;
        });

        // Attempt connection — non-blocking
        this.client.connect().catch((err: Error) => {
          this.logger.warn(`Redis connection failed (using in-memory fallback): ${err.message}`);
          this.connected = false;
        });
      } catch (err) {
        this.logger.warn(`Could not initialise Redis client: ${(err as Error).message}`);
        this.client = null;
      }
    } else {
      if (!Redis) {
        this.logger.log(
          'ioredis package not installed — using in-memory fallback. Run: npm install ioredis',
        );
      } else {
        this.logger.log('REDIS_URL not configured — using in-memory fallback');
      }
    }

    // Periodically prune expired entries from the fallback map
    this.fallbackCleanupTimer = setInterval(() => this.pruneFallbackMap(), 60_000);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.fallbackCleanupTimer) {
      clearInterval(this.fallbackCleanupTimer);
    }
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // ignore — shutting down
      }
    }
  }

  // ---------- Public API ----------

  /**
   * Set a key with a TTL (in seconds).  Returns true if the key was
   * newly created (i.e. did not already exist).
   */
  async setIfAbsent(key: string, ttlSeconds: number): Promise<boolean> {
    // Try Redis first
    if (this.client && this.connected) {
      try {
        // SET key value NX EX ttl  — returns 'OK' if set, null if exists
        const result = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
      } catch (err) {
        this.logger.warn(`Redis SET failed, falling back to in-memory: ${(err as Error).message}`);
      }
    }

    // Fallback: in-memory Map
    const now = Date.now();
    const existing = this.fallbackMap.get(key);
    if (existing && existing > now) {
      return false; // key still alive
    }
    this.fallbackMap.set(key, now + ttlSeconds * 1000);

    // Prevent unbounded growth
    if (this.fallbackMap.size > 10_000) {
      this.pruneFallbackMap();
    }

    return true;
  }

  /**
   * Check whether a key exists (and is not expired).
   */
  async exists(key: string): Promise<boolean> {
    if (this.client && this.connected) {
      try {
        return (await this.client.exists(key)) === 1;
      } catch {
        // fall through
      }
    }

    const expiry = this.fallbackMap.get(key);
    return !!expiry && expiry > Date.now();
  }

  /** Whether we are currently connected to a real Redis instance. */
  isRedisConnected(): boolean {
    return this.connected;
  }

  // ---------- Internals ----------

  private pruneFallbackMap(): void {
    const now = Date.now();
    for (const [k, expiry] of this.fallbackMap) {
      if (expiry <= now) {
        this.fallbackMap.delete(k);
      }
    }
  }
}
