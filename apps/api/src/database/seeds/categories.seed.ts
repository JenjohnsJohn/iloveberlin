import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface SeedCategory {
  name: string;
  description: string;
  children?: { name: string; description: string }[];
}

// ─── News (type='article') ───────────────────────────────────────

const ARTICLE_CATEGORIES: SeedCategory[] = [
  {
    name: 'City & Politics',
    description: 'Local government, elections, and urban development in Berlin',
    children: [
      { name: 'Local Government', description: 'Berlin senate and district politics' },
      { name: 'Elections', description: 'Election coverage and political campaigns' },
      { name: 'Urban Development', description: 'City planning and construction projects' },
      { name: 'Public Safety', description: 'Police, fire, and public safety news' },
      { name: 'Policy & Law', description: 'New legislation and regulatory changes' },
    ],
  },
  {
    name: 'Business & Economy',
    description: 'Business news, startups, and economic trends in Berlin',
    children: [
      { name: 'Startups', description: 'Berlin startup scene and funding news' },
      { name: 'Local Businesses', description: 'News from Berlin businesses and shops' },
      { name: 'Real Estate', description: 'Property market trends and developments' },
      { name: 'Jobs & Careers', description: 'Employment trends and career opportunities' },
      { name: 'Economic Trends', description: 'Economic indicators and market analysis' },
    ],
  },
  {
    name: 'Culture',
    description: 'Art, music, theater, and cultural life in Berlin',
    children: [
      { name: 'Art Exhibitions', description: 'Gallery shows and art installations' },
      { name: 'Music Scene', description: 'Concerts, albums, and Berlin music news' },
      { name: 'Theater & Film', description: 'Theater productions and film releases' },
      { name: 'Museums & Galleries', description: 'Museum exhibitions and gallery openings' },
      { name: 'Literature', description: 'Book releases, readings, and literary events' },
    ],
  },
  {
    name: 'Community',
    description: 'Neighborhood news, social issues, and community stories',
    children: [
      { name: 'Neighborhoods', description: 'News from Berlin neighborhoods and districts' },
      { name: 'Social Issues', description: 'Social challenges and community responses' },
      { name: 'Integration', description: 'Immigration, integration, and multicultural life' },
      { name: 'Volunteering', description: 'Volunteer opportunities and community service' },
      { name: 'Local Heroes', description: 'Stories of people making a difference' },
    ],
  },
  {
    name: 'Sports',
    description: 'Sports news and events in Berlin',
    children: [
      { name: 'Football', description: 'Hertha BSC, Union Berlin, and football news' },
      { name: 'Basketball', description: 'Alba Berlin and basketball coverage' },
      { name: 'Running & Athletics', description: 'Marathons, running events, and athletics' },
      { name: 'Cycling', description: 'Cycling news, races, and bike culture' },
      { name: 'Fitness', description: 'Fitness trends and gym news' },
    ],
  },
  {
    name: 'Education',
    description: 'Education news, universities, and learning in Berlin',
    children: [
      { name: 'Universities', description: 'University news and academic developments' },
      { name: 'Schools', description: 'School system news and education policy' },
      { name: 'Language Learning', description: 'German courses and language resources' },
      { name: 'Research & Innovation', description: 'Scientific research and breakthroughs' },
      { name: 'Student Life', description: 'Student culture, housing, and campus news' },
    ],
  },
  {
    name: 'Health',
    description: 'Healthcare, wellness, and public health in Berlin',
    children: [
      { name: 'Healthcare System', description: 'Hospital and healthcare system news' },
      { name: 'Mental Health', description: 'Mental health awareness and resources' },
      { name: 'Wellness', description: 'Wellness trends and healthy living' },
      { name: 'Nutrition', description: 'Nutrition science and healthy eating' },
      { name: 'Public Health', description: 'Public health campaigns and policies' },
    ],
  },
  {
    name: 'Environment',
    description: 'Sustainability, climate action, and green living in Berlin',
    children: [
      { name: 'Sustainability', description: 'Sustainable initiatives and green business' },
      { name: 'Climate Action', description: 'Climate protests, policy, and activism' },
      { name: 'Green Spaces', description: 'Parks, gardens, and urban green areas' },
      { name: 'Energy', description: 'Renewable energy and energy policy' },
      { name: 'Urban Nature', description: 'Wildlife, trees, and nature in the city' },
    ],
  },
  {
    name: 'Lifestyle',
    description: 'Food, fashion, trends, and everyday life in Berlin',
    children: [
      { name: 'Food & Dining', description: 'Restaurant openings, food trends, and reviews' },
      { name: 'Fashion & Style', description: 'Berlin fashion scene and style trends' },
      { name: 'Trends', description: 'Lifestyle trends and cultural movements' },
      { name: 'Home & Living', description: 'Interior design, home tips, and living spaces' },
      { name: 'Nightlife', description: 'Clubs, bars, and Berlin nightlife news' },
    ],
  },
  {
    name: 'Travel & Tourism',
    description: 'Day trips, attractions, and travel tips for Berlin',
    children: [
      { name: 'Day Trips', description: 'Excursions and trips around Brandenburg' },
      { name: 'Attractions', description: 'Tourist attractions and landmarks' },
      { name: 'Hidden Gems', description: 'Off-the-beaten-path places to discover' },
      { name: 'Visitor Tips', description: 'Practical tips for visitors and tourists' },
      { name: 'Seasonal Events', description: 'Christmas markets, festivals, and seasonal highlights' },
    ],
  },
];

const DEPRECATED_ARTICLE_SLUGS = [
  'general',
  'berlin-2026',
  'things-to-do',
  'technology',
  'travel',
  'health-wellness',
  'entertainment',
  'arts-culture',
  'business',
];

// ─── Videos (type='video') ───────────────────────────────────────

const VIDEO_CATEGORIES: SeedCategory[] = [
  {
    name: 'City Life',
    description: 'Explore daily life and urban scenes in Berlin',
    children: [
      { name: 'Neighborhood Tours', description: 'Walking tours of Berlin neighborhoods' },
      { name: 'Street Scenes', description: 'Capturing everyday Berlin street life' },
      { name: 'Hidden Gems', description: 'Discovering secret spots in Berlin' },
      { name: 'Day in the Life', description: 'Following Berliners through their day' },
      { name: 'Timelapse', description: 'Timelapse videos of Berlin cityscapes' },
    ],
  },
  {
    name: 'Food & Drink',
    description: 'Berlin culinary scene on video',
    children: [
      { name: 'Restaurant Reviews', description: 'Video reviews of Berlin restaurants' },
      { name: 'Street Food', description: 'Berlin street food tours and tastings' },
      { name: 'Cooking', description: 'Cooking tutorials and recipe videos' },
      { name: 'Bar Crawls', description: 'Bar tours and cocktail reviews' },
      { name: 'Market Tours', description: 'Exploring Berlin food markets' },
    ],
  },
  {
    name: 'Culture & Arts',
    description: 'Berlin cultural scene captured on video',
    children: [
      { name: 'Exhibitions', description: 'Art exhibition walkthroughs and previews' },
      { name: 'Performances', description: 'Live performance recordings and highlights' },
      { name: 'Artist Interviews', description: 'Conversations with Berlin artists' },
      { name: 'Cultural Events', description: 'Coverage of cultural festivals and events' },
      { name: 'Backstage', description: 'Behind-the-scenes at venues and studios' },
    ],
  },
  {
    name: 'Nightlife',
    description: 'Berlin nightlife and club culture on video',
    children: [
      { name: 'Club Tours', description: 'Inside Berlin legendary clubs' },
      { name: 'DJ Sets', description: 'DJ performances and set recordings' },
      { name: 'Live Music', description: 'Live music performances at Berlin venues' },
      { name: 'Bar Reviews', description: 'Video reviews of Berlin bars and lounges' },
      { name: 'After Hours', description: 'Late-night Berlin culture and events' },
    ],
  },
  {
    name: 'History & Heritage',
    description: 'Berlin history and historical sites on video',
    children: [
      { name: 'Historical Sites', description: 'Tours of Berlin historical landmarks' },
      { name: 'Berlin Wall', description: 'Stories and sites of the Berlin Wall' },
      { name: 'Architecture', description: 'Berlin architectural tours and analysis' },
      { name: 'Cold War', description: 'Cold War history and sites in Berlin' },
      { name: 'WWII', description: 'World War II history and memorials' },
    ],
  },
  {
    name: 'People & Stories',
    description: 'Personal stories and profiles from Berlin',
    children: [
      { name: 'Interviews', description: 'In-depth interviews with Berliners' },
      { name: 'Expat Stories', description: 'Stories from Berlin international community' },
      { name: 'Local Profiles', description: 'Profiles of interesting Berlin locals' },
      { name: 'Community Stories', description: 'Community initiatives and group stories' },
      { name: 'Immigrant Stories', description: 'Immigration journeys and experiences' },
    ],
  },
  {
    name: 'Explore',
    description: 'Exploring Berlin and surroundings on video',
    children: [
      { name: 'Day Trips', description: 'Video guides for day trips from Berlin' },
      { name: 'Parks & Gardens', description: 'Exploring Berlin green spaces' },
      { name: 'Bike Routes', description: 'Cycling routes and bike tour videos' },
      { name: 'Walking Tours', description: 'Guided walking tour videos' },
      { name: 'Seasonal', description: 'Seasonal activities and events in Berlin' },
    ],
  },
  {
    name: 'How-To & Guides',
    description: 'Practical video guides for Berlin life',
    children: [
      { name: 'Bureaucracy Tips', description: 'Navigating German bureaucracy on video' },
      { name: 'Moving Guide', description: 'Video guides for moving to Berlin' },
      { name: 'Language Tips', description: 'German language learning tips' },
      { name: 'Budget Living', description: 'Tips for living on a budget in Berlin' },
      { name: 'Getting Around', description: 'Transport and navigation guides' },
    ],
  },
];

// ─── Competitions (type='competition') ───────────────────────────

const COMPETITION_CATEGORIES = [
  { name: 'Photography', description: 'Photography contests and challenges' },
  { name: 'Writing & Poetry', description: 'Writing, essay, and poetry competitions' },
  { name: 'Art & Design', description: 'Art, illustration, and design contests' },
  { name: 'Music', description: 'Music performance and composition competitions' },
  { name: 'Video & Film', description: 'Video and short film competitions' },
  { name: 'Food & Recipe', description: 'Cooking and recipe competitions' },
  { name: 'Quiz & Trivia', description: 'Knowledge-based quiz and trivia contests' },
  { name: 'Sports & Fitness', description: 'Sports challenges and fitness competitions' },
];

// ─── Shared upsert helper ────────────────────────────────────────

async function upsertCategoryTree(
  queryRunner: ReturnType<DataSource['createQueryRunner']>,
  categories: SeedCategory[],
  type: string,
  deprecatedSlugs: string[],
): Promise<void> {
  // Deactivate deprecated slugs
  for (const slug of deprecatedSlugs) {
    const existing = await queryRunner.query(
      `SELECT id FROM categories WHERE slug = $1 AND type = $2`,
      [slug, type],
    );
    if (existing.length > 0) {
      await queryRunner.query(
        `UPDATE categories SET is_active = false WHERE slug = $1 AND type = $2`,
        [slug, type],
      );
      console.log(`  Deactivated deprecated ${type} category: ${slug}`);
    }
  }

  // Upsert roots and children
  for (let i = 0; i < categories.length; i++) {
    const root = categories[i];
    const rootSlug = generateSlug(root.name);

    let rootId: string;
    const existingRoot = await queryRunner.query(
      `SELECT id FROM categories WHERE slug = $1 AND type = $2`,
      [rootSlug, type],
    );

    if (existingRoot.length === 0) {
      const inserted = await queryRunner.query(
        `INSERT INTO categories (name, slug, description, display_order, is_active, type)
         VALUES ($1, $2, $3, $4, true, $5)
         RETURNING id`,
        [root.name, rootSlug, root.description, i, type],
      );
      rootId = inserted[0].id;
      console.log(`  Created root ${type} category: ${root.name}`);
    } else {
      rootId = existingRoot[0].id;
      await queryRunner.query(
        `UPDATE categories SET name = $1, description = $2, display_order = $3, is_active = true, parent_id = NULL
         WHERE id = $4`,
        [root.name, root.description, i, rootId],
      );
      console.log(`  Updated root ${type} category: ${root.name}`);
    }

    const children = root.children || [];
    for (let j = 0; j < children.length; j++) {
      const child = children[j];
      const childSlug = generateSlug(child.name);

      const existingChild = await queryRunner.query(
        `SELECT id FROM categories WHERE slug = $1 AND type = $2`,
        [childSlug, type],
      );

      if (existingChild.length === 0) {
        await queryRunner.query(
          `INSERT INTO categories (name, slug, description, display_order, is_active, type, parent_id)
           VALUES ($1, $2, $3, $4, true, $5, $6)`,
          [child.name, childSlug, child.description, j, type, rootId],
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

    // Deactivate stale children of this root that are no longer in the seed definition
    const expectedChildSlugs = children.map((c) => generateSlug(c.name));
    if (expectedChildSlugs.length > 0) {
      const placeholders = expectedChildSlugs.map((_, idx) => `$${idx + 3}`).join(', ');
      const staleRows = await queryRunner.query(
        `SELECT name, slug FROM categories
         WHERE parent_id = $1 AND type = $2 AND is_active = true AND slug NOT IN (${placeholders})`,
        [rootId, type, ...expectedChildSlugs],
      );
      if (staleRows.length > 0) {
        await queryRunner.query(
          `UPDATE categories SET is_active = false
           WHERE parent_id = $1 AND type = $2 AND is_active = true AND slug NOT IN (${placeholders})`,
          [rootId, type, ...expectedChildSlugs],
        );
        for (const s of staleRows) {
          console.log(`    Deactivated stale subcategory: ${s.name} (${s.slug})`);
        }
      }
    }
  }
}

export async function seedCategories(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    // ── Article categories ──
    console.log('  Seeding article categories...');
    await upsertCategoryTree(queryRunner, ARTICLE_CATEGORIES, 'article', DEPRECATED_ARTICLE_SLUGS);

    // ── Video categories ──
    console.log('  Seeding video categories...');
    await upsertCategoryTree(queryRunner, VIDEO_CATEGORIES, 'video', []);

    // ── Competition categories (flat, no children) ──
    console.log('  Seeding competition categories...');
    for (let i = 0; i < COMPETITION_CATEGORIES.length; i++) {
      const cat = COMPETITION_CATEGORIES[i];
      const slug = generateSlug(cat.name);

      const existing = await queryRunner.query(
        `SELECT id FROM categories WHERE slug = $1 AND type = 'competition'`,
        [slug],
      );

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO categories (name, slug, description, display_order, is_active, type)
           VALUES ($1, $2, $3, $4, true, 'competition')`,
          [cat.name, slug, cat.description, i],
        );
        console.log(`  Created competition category: ${cat.name}`);
      } else {
        await queryRunner.query(
          `UPDATE categories SET name = $1, description = $2, display_order = $3, is_active = true
           WHERE id = $4`,
          [cat.name, cat.description, i, existing[0].id],
        );
        console.log(`  Updated competition category: ${cat.name}`);
      }
    }

    console.log('Categories seed completed.');
  } finally {
    await queryRunner.release();
  }
}
