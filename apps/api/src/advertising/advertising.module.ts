import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdCampaign } from '../admin/entities/ad-campaign.entity';
import { AdPlacement } from '../admin/entities/ad-placement.entity';
import { AdvertisingService } from './advertising.service';
import {
  AdsPublicController,
  CampaignsAdminController,
  PlacementsAdminController,
} from './advertising.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdCampaign, AdPlacement])],
  providers: [AdvertisingService],
  controllers: [
    AdsPublicController,
    CampaignsAdminController,
    PlacementsAdminController,
  ],
  exports: [AdvertisingService],
})
export class AdvertisingModule {}
