import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { AdCampaign } from './entities/ad-campaign.entity';
import { AdPlacement } from './entities/ad-placement.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { User } from '../users/entities/user.entity';
import { Article } from '../articles/entities/article.entity';
import { Event } from '../events/entities/event.entity';
import { Restaurant } from '../dining/entities/restaurant.entity';
import { Video } from '../videos/entities/video.entity';
import { Competition } from '../competitions/entities/competition.entity';
import { PageView } from '../analytics/entities/page-view.entity';
import { AdminService } from './admin.service';
import { SettingsService } from './settings.service';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityLog, AdCampaign, AdPlacement, SiteSetting,
      User, Article, Event, Restaurant, Video, Competition, PageView,
    ]),
    UsersModule,
  ],
  providers: [AdminService, SettingsService],
  controllers: [AdminController, AdminUsersController, AdminSettingsController],
  exports: [AdminService, SettingsService],
})
export class AdminModule {}
