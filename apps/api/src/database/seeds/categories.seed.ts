import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

const DEFAULT_CATEGORIES: CategorySeed[] = [
  {
    name: 'General',
    slug: 'general',
    description: 'General news and updates about Berlin',
    display_order: 0,
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Entertainment news, nightlife, and events in Berlin',
    display_order: 1,
  },
  {
    name: 'Arts & Culture',
    slug: 'arts-culture',
    description: 'Art exhibitions, museums, and cultural events',
    display_order: 2,
  },
  {
    name: 'Community',
    slug: 'community',
    description: 'Community stories, neighborhood news, and local initiatives',
    display_order: 3,
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business news, startups, and the Berlin economy',
    display_order: 4,
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports news and events in Berlin',
    display_order: 5,
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Travel tips, day trips, and exploring Berlin and beyond',
    display_order: 6,
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Health, wellness, fitness, and wellbeing in Berlin',
    display_order: 7,
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Education news, universities, and learning opportunities',
    display_order: 8,
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Tech scene, digital innovation, and startups in Berlin',
    display_order: 9,
  },
  {
    name: 'Things to Do',
    slug: 'things-to-do',
    description: 'Activities, experiences, and things to do in Berlin',
    display_order: 10,
  },
  {
    name: 'Berlin 2026',
    slug: 'berlin-2026',
    description: 'Special coverage of Berlin in 2026',
    display_order: 11,
  },
];

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    for (const category of DEFAULT_CATEGORIES) {
      const existing = await queryRunner.query(
        `SELECT id FROM categories WHERE slug = $1`,
        [category.slug],
      );

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO categories (name, slug, description, display_order, is_active, type)
           VALUES ($1, $2, $3, $4, true, 'article')`,
          [category.name, category.slug, category.description, category.display_order],
        );
        console.log(`  Created category: ${category.name}`);
      } else {
        console.log(`  Category already exists: ${category.name}`);
      }
    }

    console.log('Categories seed completed.');
  } finally {
    await queryRunner.release();
  }
}
