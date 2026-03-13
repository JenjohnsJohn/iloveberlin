import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ParseEnumPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdvertisingService } from './advertising.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdPosition } from '../admin/entities/ad-placement.entity';
import { CampaignStatus } from '../admin/entities/ad-campaign.entity';

// ─── Public Ad Endpoints ──────────────────────────────────────

@Controller('ads')
export class AdsPublicController {
  constructor(private readonly advertisingService: AdvertisingService) {}

  @Get(':position')
  getActiveAd(@Param('position', new ParseEnumPipe(AdPosition)) position: AdPosition) {
    return this.advertisingService.getActiveAd(position);
  }

  @Post(':placementId/impression')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackImpression(@Param('placementId', ParseUUIDPipe) placementId: string) {
    return this.advertisingService.trackImpression(placementId);
  }

  @Post(':placementId/click')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackClick(@Param('placementId', ParseUUIDPipe) placementId: string) {
    return this.advertisingService.trackClick(placementId);
  }
}

// ─── Admin Campaign Endpoints ─────────────────────────────────

@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class CampaignsAdminController {
  constructor(private readonly advertisingService: AdvertisingService) {}

  @Post()
  createCampaign(
    @Body()
    body: {
      name: string;
      advertiser: string;
      start_date: string;
      end_date: string;
      budget?: number;
    },
  ) {
    return this.advertisingService.createCampaign(body);
  }

  @Get()
  findAllCampaigns() {
    return this.advertisingService.findAllCampaigns();
  }

  @Get(':id')
  findCampaignById(@Param('id', ParseUUIDPipe) id: string) {
    return this.advertisingService.findCampaignById(id);
  }

  @Put(':id')
  updateCampaign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: Partial<{
      name: string;
      advertiser: string;
      status: CampaignStatus;
      start_date: string;
      end_date: string;
      budget: number;
    }>,
  ) {
    return this.advertisingService.updateCampaign(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCampaign(@Param('id', ParseUUIDPipe) id: string) {
    return this.advertisingService.deleteCampaign(id);
  }

  @Post(':id/placements')
  createPlacement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      position: AdPosition;
      image_url: string;
      link_url: string;
      alt_text: string;
    },
  ) {
    return this.advertisingService.createPlacement(id, body);
  }
}

// ─── Admin Placement Endpoints ────────────────────────────────

@Controller('admin/placements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class PlacementsAdminController {
  constructor(private readonly advertisingService: AdvertisingService) {}

  @Put(':id')
  updatePlacement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: Partial<{
      position: AdPosition;
      image_url: string;
      link_url: string;
      alt_text: string;
      is_active: boolean;
    }>,
  ) {
    return this.advertisingService.updatePlacement(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePlacement(@Param('id', ParseUUIDPipe) id: string) {
    return this.advertisingService.deletePlacement(id);
  }
}
