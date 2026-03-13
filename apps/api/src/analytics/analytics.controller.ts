import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// ─── Public Analytics Endpoints ──────────────────────────────────

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsPublicController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('pageview')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({ summary: 'Track a page view' })
  @ApiResponse({ status: 201, description: 'Page view tracked successfully' })
  trackPageView(@Body() dto: TrackPageViewDto) {
    return this.analyticsService.trackPageView(
      dto.path,
      dto.userId,
      dto.sessionId,
      dto.referrer,
      dto.userAgent,
      dto.ip,
    );
  }
}

// ─── Admin Analytics Endpoints ───────────────────────────────────

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AnalyticsAdminController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily analytics stats' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Daily analytics data' })
  getDailyStats(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.analyticsService.getDailyStats(start, end);
  }

  @Get('top-pages')
  @ApiOperation({ summary: 'Get most viewed pages' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Top pages data' })
  getTopPages(@Query('days') days?: string) {
    return this.analyticsService.getTopPages(days ? parseInt(days, 10) : 30);
  }

  @Get('traffic-sources')
  @ApiOperation({ summary: 'Get traffic source breakdown' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Traffic sources data' })
  getTrafficSources(@Query('days') days?: string) {
    return this.analyticsService.getTrafficSources(days ? parseInt(days, 10) : 30);
  }

  @Get('search-trends')
  @ApiOperation({ summary: 'Get popular search terms' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Search trends data' })
  getSearchTrends(@Query('days') days?: string) {
    return this.analyticsService.getSearchTrends(days ? parseInt(days, 10) : 30);
  }
}
