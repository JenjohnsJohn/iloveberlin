import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface SeedCategory {
  name: string;
  description: string;
  children?: { name: string; description: string }[];
}

const EVENT_CATEGORIES: SeedCategory[] = [
  {
    name: 'Entertainment',
    description: 'Live performances, concerts, comedy, and festival events',
    children: [
      { name: 'Live Music', description: 'Live music performances and gigs' },
      { name: 'Concerts', description: 'Concert events and touring acts' },
      { name: 'Stand-Up Comedy', description: 'Comedy shows and open mic nights' },
      { name: 'Theater Shows', description: 'Theater, drama, and stage performances' },
      { name: 'Movie Screenings', description: 'Film screenings and cinema events' },
      { name: 'Festivals', description: 'Multi-day festivals and celebrations' },
    ],
  },
  {
    name: 'Sports',
    description: 'Sporting events, fitness, and athletic competitions',
    children: [
      { name: 'Football Matches', description: 'Football and soccer match events' },
      { name: 'Basketball Games', description: 'Basketball game events' },
      { name: 'Running Events', description: 'Marathons, fun runs, and running events' },
      { name: 'Cycling Events', description: 'Cycling races and bike events' },
      { name: 'Fitness Competitions', description: 'Fitness challenges and competitions' },
      { name: 'Martial Arts Events', description: 'Martial arts competitions and demonstrations' },
    ],
  },
  {
    name: 'Food & Dining',
    description: 'Food festivals, tastings, and culinary events',
    children: [
      { name: 'Food Festivals', description: 'Large-scale food festival events' },
      { name: 'Street Food Markets', description: 'Street food markets and pop-ups' },
      { name: 'Restaurant Events', description: 'Special restaurant events and dinners' },
      { name: 'Wine Tastings', description: 'Wine tasting events and vineyard tours' },
      { name: 'Beer Festivals', description: 'Beer festivals and craft beer events' },
      { name: 'Cooking Workshops', description: 'Hands-on cooking classes and workshops' },
    ],
  },
  {
    name: 'Arts & Culture',
    description: 'Art exhibitions, museum events, and cultural festivals',
    children: [
      { name: 'Art Exhibitions', description: 'Art exhibitions and installations' },
      { name: 'Museum Events', description: 'Museum nights and special exhibits' },
      { name: 'Cultural Festivals', description: 'Cultural celebrations and heritage events' },
      { name: 'Dance Performances', description: 'Dance shows and performances' },
      { name: 'Literature Readings', description: 'Author readings and literary events' },
      { name: 'Gallery Openings', description: 'Gallery opening nights and vernissages' },
    ],
  },
  {
    name: 'Night',
    description: 'Club nights, DJ parties, and late-night events',
    children: [
      { name: 'Club Nights', description: 'Club events and themed nights' },
      { name: 'DJ Parties', description: 'DJ sets and electronic music parties' },
      { name: 'Night Festivals', description: 'Late-night festivals and events' },
      { name: 'After Parties', description: 'After-party events and late gatherings' },
      { name: 'Lounge Events', description: 'Lounge nights and chill events' },
    ],
  },
  {
    name: 'Community',
    description: 'Neighborhood events, meetups, and community gatherings',
    children: [
      { name: 'Neighborhood Events', description: 'Local neighborhood events and block parties' },
      { name: 'Community Meetups', description: 'Community meetups and social gatherings' },
      { name: 'Family Gatherings', description: 'Family-friendly events and activities' },
      { name: 'Local Celebrations', description: 'Local holiday and seasonal celebrations' },
      { name: 'Cultural Meetups', description: 'Cultural exchange meetups and groups' },
    ],
  },
  {
    name: 'Social Responsibility',
    description: 'Charity events, fundraisers, and social awareness initiatives',
    children: [
      { name: 'Charity Events', description: 'Charity galas and benefit events' },
      { name: 'Fundraising Events', description: 'Fundraising campaigns and events' },
      { name: 'Environmental Initiatives', description: 'Environmental awareness and green events' },
      { name: 'Social Awareness Events', description: 'Social cause awareness and advocacy events' },
    ],
  },
  {
    name: 'Education',
    description: 'Workshops, seminars, conferences, and learning events',
    children: [
      { name: 'Workshops', description: 'Hands-on workshops and skill-building sessions' },
      { name: 'Seminars', description: 'Seminars and expert talks' },
      { name: 'Conferences', description: 'Professional conferences and summits' },
      { name: 'Training Programs', description: 'Training sessions and certification programs' },
      { name: 'Academic Events', description: 'University and academic events' },
    ],
  },
  {
    name: 'Volunteer',
    description: 'Volunteering opportunities and community support projects',
    children: [
      { name: 'Environmental Volunteering', description: 'Environmental cleanup and conservation volunteering' },
      { name: 'Community Support Projects', description: 'Community aid and support projects' },
      { name: 'Charity Volunteering', description: 'Charity volunteer opportunities' },
      { name: 'Social Programs', description: 'Social outreach and mentoring programs' },
    ],
  },
  {
    name: 'Other',
    description: 'Networking events, pop-ups, and unique experiences',
    children: [
      { name: 'Networking Events', description: 'Professional networking and mixer events' },
      { name: 'Pop-Up Experiences', description: 'Pop-up shops, restaurants, and experiences' },
      { name: 'Experimental Events', description: 'Experimental and avant-garde events' },
      { name: 'Special Announcements', description: 'Special announcements and launch events' },
    ],
  },
];

// Old flat categories that no longer exist in the new hierarchy
const DEPRECATED_SLUGS = [
  'music',
  'food-drink',
  'arts',
  'family',
  'nightlife',
  'theater-film',
  'markets-fairs',
  'festivals',
  'tech-innovation',
  'wellness',
  'tours-walks',
];

export async function seedEventCategories(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    // Deactivate deprecated flat categories
    for (const slug of DEPRECATED_SLUGS) {
      const existing = await queryRunner.query(
        `SELECT id FROM categories WHERE slug = $1 AND type = 'event'`,
        [slug],
      );
      if (existing.length > 0) {
        await queryRunner.query(
          `UPDATE categories SET is_active = false WHERE slug = $1 AND type = 'event'`,
          [slug],
        );
        console.log(`  Deactivated deprecated event category: ${slug}`);
      }
    }

    // Insert/upsert root categories and their children
    for (let i = 0; i < EVENT_CATEGORIES.length; i++) {
      const root = EVENT_CATEGORIES[i];
      const rootSlug = generateSlug(root.name);

      // Upsert root category
      let rootId: string;
      const existingRoot = await queryRunner.query(
        `SELECT id FROM categories WHERE slug = $1 AND type = 'event'`,
        [rootSlug],
      );

      if (existingRoot.length === 0) {
        const inserted = await queryRunner.query(
          `INSERT INTO categories (name, slug, description, display_order, is_active, type)
           VALUES ($1, $2, $3, $4, true, 'event')
           RETURNING id`,
          [root.name, rootSlug, root.description, i],
        );
        rootId = inserted[0].id;
        console.log(`  Created root event category: ${root.name}`);
      } else {
        rootId = existingRoot[0].id;
        await queryRunner.query(
          `UPDATE categories SET name = $1, description = $2, display_order = $3, is_active = true, parent_id = NULL
           WHERE id = $4`,
          [root.name, root.description, i, rootId],
        );
        console.log(`  Updated root event category: ${root.name}`);
      }

      // Insert/upsert children
      const children = root.children || [];
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        const childSlug = generateSlug(child.name);

        const existingChild = await queryRunner.query(
          `SELECT id FROM categories WHERE slug = $1 AND type = 'event'`,
          [childSlug],
        );

        if (existingChild.length === 0) {
          await queryRunner.query(
            `INSERT INTO categories (name, slug, description, display_order, is_active, type, parent_id)
             VALUES ($1, $2, $3, $4, true, 'event', $5)`,
            [child.name, childSlug, child.description, j, rootId],
          );
          console.log(`    Created subcategory: ${child.name}`);
        } else {
          await queryRunner.query(
            `UPDATE categories SET name = $1, description = $2, display_order = $3, is_active = true, parent_id = $4
             WHERE id = $5`,
            [child.name, child.description, j, rootId, existingChild[0].id],
          );
          console.log(`    Updated subcategory: ${child.name}`);
        }
      }
    }

    console.log('Event categories seed completed.');
  } finally {
    await queryRunner.release();
  }
}
