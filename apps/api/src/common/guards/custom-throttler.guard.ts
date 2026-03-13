import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom throttler guard with different rate limits per route type.
 *
 * Rate limits:
 * - Auth endpoints (/api/auth/*): 10 requests per minute
 * - Public API: 100 requests per minute
 * - Admin API (/api/admin/*): 200 requests per minute
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips?.length ? req.ips[0] : req.ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path: string = request.route?.path || request.url || '';

    // Determine rate limit based on route type
    if (path.includes('/auth/')) {
      // Auth endpoints: 10 requests per minute
      request.throttlerLimit = 10;
      request.throttlerTtl = 60000;
    } else if (path.includes('/admin/')) {
      // Admin API: 200 requests per minute
      request.throttlerLimit = 200;
      request.throttlerTtl = 60000;
    } else {
      // Public API: 100 requests per minute
      request.throttlerLimit = 100;
      request.throttlerTtl = 60000;
    }

    return super.canActivate(context);
  }
}
