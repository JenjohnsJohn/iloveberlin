import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdCampaign, CampaignStatus } from '../admin/entities/ad-campaign.entity';
import { AdPlacement, AdPosition } from '../admin/entities/ad-placement.entity';

@Injectable()
export class AdvertisingService {
  constructor(
    @InjectRepository(AdCampaign)
    private readonly campaignRepository: Repository<AdCampaign>,
    @InjectRepository(AdPlacement)
    private readonly placementRepository: Repository<AdPlacement>,
  ) {}

  // ─── Campaign CRUD ─────────────────────────────────────────

  async createCampaign(data: {
    name: string;
    advertiser: string;
    start_date: string;
    end_date: string;
    budget?: number;
  }): Promise<AdCampaign> {
    const campaign = this.campaignRepository.create({
      name: data.name,
      advertiser: data.advertiser,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      budget: data.budget || null,
      status: CampaignStatus.DRAFT,
    });
    return this.campaignRepository.save(campaign);
  }

  async findAllCampaigns(): Promise<AdCampaign[]> {
    return this.campaignRepository.find({
      relations: ['placements'],
      order: { created_at: 'DESC' },
    });
  }

  async findCampaignById(id: string): Promise<AdCampaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['placements'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with id "${id}" not found`);
    }

    return campaign;
  }

  async updateCampaign(
    id: string,
    data: Partial<{
      name: string;
      advertiser: string;
      status: CampaignStatus;
      start_date: string;
      end_date: string;
      budget: number;
    }>,
  ): Promise<AdCampaign> {
    const campaign = await this.findCampaignById(id);

    if (data.name !== undefined) campaign.name = data.name;
    if (data.advertiser !== undefined) campaign.advertiser = data.advertiser;
    if (data.status !== undefined) campaign.status = data.status;
    if (data.start_date !== undefined) campaign.start_date = new Date(data.start_date);
    if (data.end_date !== undefined) campaign.end_date = new Date(data.end_date);
    if (data.budget !== undefined) campaign.budget = data.budget;

    await this.campaignRepository.save(campaign);
    return this.findCampaignById(id);
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.findCampaignById(id);
    await this.campaignRepository.remove(campaign);
  }

  // ─── Placement CRUD ────────────────────────────────────────

  async createPlacement(
    campaignId: string,
    data: {
      position: AdPosition;
      image_url: string;
      link_url: string;
      alt_text: string;
    },
  ): Promise<AdPlacement> {
    await this.findCampaignById(campaignId); // ensure campaign exists

    const placement = this.placementRepository.create({
      campaign_id: campaignId,
      position: data.position,
      image_url: data.image_url,
      link_url: data.link_url,
      alt_text: data.alt_text,
    });
    return this.placementRepository.save(placement);
  }

  async updatePlacement(
    id: string,
    data: Partial<{
      position: AdPosition;
      image_url: string;
      link_url: string;
      alt_text: string;
      is_active: boolean;
    }>,
  ): Promise<AdPlacement> {
    const placement = await this.placementRepository.findOne({
      where: { id },
    });

    if (!placement) {
      throw new NotFoundException(`Placement with id "${id}" not found`);
    }

    if (data.position !== undefined) placement.position = data.position;
    if (data.image_url !== undefined) placement.image_url = data.image_url;
    if (data.link_url !== undefined) placement.link_url = data.link_url;
    if (data.alt_text !== undefined) placement.alt_text = data.alt_text;
    if (data.is_active !== undefined) placement.is_active = data.is_active;

    return this.placementRepository.save(placement);
  }

  async deletePlacement(id: string): Promise<void> {
    const placement = await this.placementRepository.findOne({
      where: { id },
    });

    if (!placement) {
      throw new NotFoundException(`Placement with id "${id}" not found`);
    }

    await this.placementRepository.remove(placement);
  }

  // ─── Public Ad Serving ─────────────────────────────────────

  async getActiveAd(position: AdPosition): Promise<AdPlacement | null> {
    const now = new Date();

    const placement = await this.placementRepository
      .createQueryBuilder('placement')
      .innerJoinAndSelect('placement.campaign', 'campaign')
      .where('placement.position = :position', { position })
      .andWhere('placement.is_active = true')
      .andWhere('campaign.status = :status', { status: CampaignStatus.ACTIVE })
      .andWhere('campaign.start_date <= :now', { now })
      .andWhere('campaign.end_date >= :now', { now })
      .orderBy('RANDOM()')
      .getOne();

    return placement;
  }

  async trackImpression(placementId: string): Promise<void> {
    const placement = await this.placementRepository.findOne({
      where: { id: placementId },
    });

    if (!placement) {
      throw new NotFoundException(`Placement with id "${placementId}" not found`);
    }

    await this.placementRepository.increment({ id: placementId }, 'impressions', 1);
    await this.campaignRepository.increment(
      { id: placement.campaign_id },
      'impressions',
      1,
    );
  }

  async trackClick(placementId: string): Promise<void> {
    const placement = await this.placementRepository.findOne({
      where: { id: placementId },
    });

    if (!placement) {
      throw new NotFoundException(`Placement with id "${placementId}" not found`);
    }

    await this.placementRepository.increment({ id: placementId }, 'clicks', 1);
    await this.campaignRepository.increment(
      { id: placement.campaign_id },
      'clicks',
      1,
    );
  }
}
