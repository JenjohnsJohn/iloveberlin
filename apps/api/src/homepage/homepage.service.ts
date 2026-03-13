import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomepageFeatured } from './entities/homepage-featured.entity';

export interface HomepageData {
  hero: HomepageFeatured[];
  trending: HomepageFeatured[];
  events: HomepageFeatured[];
  weekend: HomepageFeatured[];
  dining: HomepageFeatured[];
  videos: HomepageFeatured[];
  competitions: HomepageFeatured[];
  classifieds: HomepageFeatured[];
}

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(HomepageFeatured)
    private readonly featuredRepository: Repository<HomepageFeatured>,
  ) {}

  async getHomepageData(): Promise<HomepageData> {
    const allFeatured = await this.featuredRepository.find({
      order: { section: 'ASC', sort_order: 'ASC' },
    });

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
      if (sections[sectionKey]) {
        sections[sectionKey].push(item);
      }
    }

    return sections;
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
