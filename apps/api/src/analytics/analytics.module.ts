import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageView } from './entities/page-view.entity';
import { AnalyticsDaily } from './entities/analytics-daily.entity';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsPublicController,
  AnalyticsAdminController,
} from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageView, AnalyticsDaily])],
  providers: [AnalyticsService],
  controllers: [AnalyticsPublicController, AnalyticsAdminController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
