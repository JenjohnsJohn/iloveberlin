# Seed Data

> Essential reference data for the ILoveBerlin platform. These INSERT statements should be run after migrations to populate lookup tables and create initial admin accounts.

---

## Seed Execution Order

Seeds must respect foreign key dependencies:

```
1. PostgreSQL extensions
2. Users (admin account)
3. Categories (article, event, video)
4. Guide topics
5. Cuisines
6. Classified categories
7. Product categories
8. Video series
9. Tags
10. Notification preferences (for admin)
```

---

## 1. PostgreSQL Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity for search
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- Accent-insensitive search
```

---

## 2. Admin User

```sql
-- Super admin account
-- Password should be changed on first login
-- In production, use environment variables for the email and a properly hashed password
INSERT INTO users (id, email, password_hash, display_name, role, email_verified, status, bio)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@iloveberlin.biz',
  -- bcrypt hash of 'ChangeMe123!' with cost factor 12
  '$2b$12$LJ3m4ys2Kq9YCg0hXh5W3eGzVbJK5rGqN0w5nEf1QxV8kT3pK6Puy',
  'ILB Admin',
  'super_admin',
  TRUE,
  'active',
  'Platform administrator'
)
ON CONFLICT (email) DO NOTHING;

-- Admin notification preferences (all off - admin manages via dashboard)
INSERT INTO notification_preferences (user_id, email_new_articles, email_competitions, push_events, push_articles)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  FALSE, FALSE, FALSE, FALSE
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## 3. Article Categories (12)

```sql
INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'News',             'news',             'Latest Berlin news and updates',                       'article', 1),
  ('10000000-0000-0000-0000-000000000002', 'Culture',          'culture',          'Art, music, theater, and cultural events',              'article', 2),
  ('10000000-0000-0000-0000-000000000003', 'Food & Drink',     'food-and-drink',   'Restaurant reviews, bars, cafes, and food culture',     'article', 3),
  ('10000000-0000-0000-0000-000000000004', 'Nightlife',        'nightlife',        'Clubs, bars, and Berlin after dark',                    'article', 4),
  ('10000000-0000-0000-0000-000000000005', 'Lifestyle',        'lifestyle',        'Living in Berlin: tips, trends, and wellness',          'article', 5),
  ('10000000-0000-0000-0000-000000000006', 'Travel',           'travel',           'Day trips, weekend getaways, and travel from Berlin',   'article', 6),
  ('10000000-0000-0000-0000-000000000007', 'Expat Life',       'expat-life',       'Resources, stories, and advice for expats in Berlin',   'article', 7),
  ('10000000-0000-0000-0000-000000000008', 'Property',         'property',         'Real estate, housing market, and rental advice',        'article', 8),
  ('10000000-0000-0000-0000-000000000009', 'Business',         'business',         'Startups, economy, and business news in Berlin',        'article', 9),
  ('10000000-0000-0000-0000-000000000010', 'Sports',           'sports',           'Sports events, teams, and outdoor activities',           'article', 10),
  ('10000000-0000-0000-0000-000000000011', 'Opinion',          'opinion',          'Editorials, columns, and opinion pieces',               'article', 11),
  ('10000000-0000-0000-0000-000000000012', 'History',          'history',          'Berlin''s rich and complex history',                    'article', 12)
ON CONFLICT DO NOTHING;
```

---

## 4. Event Categories (8)

```sql
INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES
  ('11000000-0000-0000-0000-000000000001', 'Music',            'music',            'Concerts, festivals, and live music events',            'event', 1),
  ('11000000-0000-0000-0000-000000000002', 'Art',              'art',              'Exhibitions, gallery openings, and art fairs',          'event', 2),
  ('11000000-0000-0000-0000-000000000003', 'Food & Markets',   'food-markets',     'Food festivals, street markets, and tastings',          'event', 3),
  ('11000000-0000-0000-0000-000000000004', 'Film',             'film',             'Cinema screenings, premieres, and film festivals',      'event', 4),
  ('11000000-0000-0000-0000-000000000005', 'Sports',           'sports-events',    'Sports events, runs, and outdoor activities',            'event', 5),
  ('11000000-0000-0000-0000-000000000006', 'Nightlife',        'nightlife-events', 'Club nights, DJ sets, and late-night events',            'event', 6),
  ('11000000-0000-0000-0000-000000000007', 'Comedy',           'comedy',           'Stand-up comedy, improv, and sketch shows',              'event', 7),
  ('11000000-0000-0000-0000-000000000008', 'Networking',       'networking',       'Professional networking, meetups, and conferences',      'event', 8)
ON CONFLICT DO NOTHING;
```

---

## 5. Video Categories (5)

```sql
INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES
  ('12000000-0000-0000-0000-000000000001', 'City Tours',       'city-tours',       'Virtual walking tours and neighborhood explorations',   'video', 1),
  ('12000000-0000-0000-0000-000000000002', 'Interviews',       'interviews',       'Conversations with local personalities and creators',   'video', 2),
  ('12000000-0000-0000-0000-000000000003', 'Food & Cooking',   'food-cooking',     'Berlin food scene coverage and cooking tutorials',      'video', 3),
  ('12000000-0000-0000-0000-000000000004', 'Culture & Events',  'culture-events',  'Coverage of Berlin''s cultural life and major events',  'video', 4),
  ('12000000-0000-0000-0000-000000000005', 'Tips & How-To',    'tips-how-to',      'Practical guides for living and thriving in Berlin',    'video', 5)
ON CONFLICT DO NOTHING;
```

---

## 6. Guide Topics (8)

```sql
INSERT INTO guide_topics (id, name, slug, description, icon, sort_order) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Visa & Immigration',     'visa-immigration',     'Everything about German visas, residence permits, and immigration procedures.',             'passport',    1),
  ('30000000-0000-0000-0000-000000000002', 'Housing',                'housing',               'Finding and securing an apartment in Berlin. Neighborhoods, rental law, and tips.',          'home',        2),
  ('30000000-0000-0000-0000-000000000003', 'Healthcare',             'healthcare',            'Navigating the German healthcare system, insurance options, and finding doctors.',           'heart',       3),
  ('30000000-0000-0000-0000-000000000004', 'Finance & Banking',      'finance-banking',       'Opening a bank account, understanding German taxes, and managing finances.',                'bank',        4),
  ('30000000-0000-0000-0000-000000000005', 'Working in Berlin',      'working-in-berlin',     'The job market, freelance visa, co-working spaces, and employment law.',                    'briefcase',   5),
  ('30000000-0000-0000-0000-000000000006', 'Education',              'education',             'Schools, universities, German language courses, and continuing education.',                 'graduation',  6),
  ('30000000-0000-0000-0000-000000000007', 'Transport',              'transport',             'Getting around Berlin: BVG, S-Bahn, cycling infrastructure, and car sharing.',              'train',       7),
  ('30000000-0000-0000-0000-000000000008', 'Settling In',            'settling-in',           'First steps: Anmeldung, phone contracts, internet, furniture, and essential paperwork.',    'checklist',   8)
ON CONFLICT DO NOTHING;
```

---

## 7. Cuisines (~30)

```sql
INSERT INTO cuisines (id, name, slug, sort_order) VALUES
  ('50000000-0000-0000-0000-000000000001', 'German',          'german',          1),
  ('50000000-0000-0000-0000-000000000002', 'Turkish',         'turkish',         2),
  ('50000000-0000-0000-0000-000000000003', 'Vietnamese',      'vietnamese',      3),
  ('50000000-0000-0000-0000-000000000004', 'Italian',         'italian',         4),
  ('50000000-0000-0000-0000-000000000005', 'Japanese',        'japanese',        5),
  ('50000000-0000-0000-0000-000000000006', 'Chinese',         'chinese',         6),
  ('50000000-0000-0000-0000-000000000007', 'Indian',          'indian',          7),
  ('50000000-0000-0000-0000-000000000008', 'Thai',            'thai',            8),
  ('50000000-0000-0000-0000-000000000009', 'Mexican',         'mexican',         9),
  ('50000000-0000-0000-0000-000000000010', 'Korean',          'korean',         10),
  ('50000000-0000-0000-0000-000000000011', 'Lebanese',        'lebanese',       11),
  ('50000000-0000-0000-0000-000000000012', 'Greek',           'greek',          12),
  ('50000000-0000-0000-0000-000000000013', 'French',          'french',         13),
  ('50000000-0000-0000-0000-000000000014', 'Spanish',         'spanish',        14),
  ('50000000-0000-0000-0000-000000000015', 'American',        'american',       15),
  ('50000000-0000-0000-0000-000000000016', 'Ethiopian',       'ethiopian',      16),
  ('50000000-0000-0000-0000-000000000017', 'Georgian',        'georgian',       17),
  ('50000000-0000-0000-0000-000000000018', 'Persian',         'persian',        18),
  ('50000000-0000-0000-0000-000000000019', 'Israeli',         'israeli',        19),
  ('50000000-0000-0000-0000-000000000020', 'Vegan',           'vegan',          20),
  ('50000000-0000-0000-0000-000000000021', 'Vegetarian',      'vegetarian',     21),
  ('50000000-0000-0000-0000-000000000022', 'Seafood',         'seafood',        22),
  ('50000000-0000-0000-0000-000000000023', 'Pizza',           'pizza',          23),
  ('50000000-0000-0000-0000-000000000024', 'Burger',          'burger',         24),
  ('50000000-0000-0000-0000-000000000025', 'Ramen',           'ramen',          25),
  ('50000000-0000-0000-0000-000000000026', 'Sushi',           'sushi',          26),
  ('50000000-0000-0000-0000-000000000027', 'Brunch',          'brunch',         27),
  ('50000000-0000-0000-0000-000000000028', 'Cafe',            'cafe',           28),
  ('50000000-0000-0000-0000-000000000029', 'Street Food',     'street-food',    29),
  ('50000000-0000-0000-0000-000000000030', 'Fine Dining',     'fine-dining',    30)
ON CONFLICT DO NOTHING;
```

---

## 8. Classified Categories (7)

```sql
INSERT INTO classified_categories (id, name, slug, icon, sort_order) VALUES
  ('80000000-0000-0000-0000-000000000001', 'Housing',            'housing',            'home',       1),
  ('80000000-0000-0000-0000-000000000002', 'Jobs',               'jobs',               'briefcase',  2),
  ('80000000-0000-0000-0000-000000000003', 'For Sale',           'for-sale',           'tag',        3),
  ('80000000-0000-0000-0000-000000000004', 'Services',           'services',           'wrench',     4),
  ('80000000-0000-0000-0000-000000000005', 'Community',          'community',          'users',      5),
  ('80000000-0000-0000-0000-000000000006', 'Language Exchange',  'language-exchange',  'chat',       6),
  ('80000000-0000-0000-0000-000000000007', 'Lost & Found',       'lost-and-found',     'search',     7)
ON CONFLICT DO NOTHING;
```

---

## 9. Product Categories (5)

```sql
INSERT INTO product_categories (id, name, slug, sort_order) VALUES
  ('90000000-0000-0000-0000-000000000001', 'Clothing',     'clothing',     1),
  ('90000000-0000-0000-0000-000000000002', 'Prints',       'prints',       2),
  ('90000000-0000-0000-0000-000000000003', 'Accessories',  'accessories',  3),
  ('90000000-0000-0000-0000-000000000004', 'Books',        'books',        4),
  ('90000000-0000-0000-0000-000000000005', 'Stationery',   'stationery',   5)
ON CONFLICT DO NOTHING;
```

---

## 10. Video Series (5)

```sql
INSERT INTO video_series (id, name, slug, description, sort_order) VALUES
  ('60000000-0000-0000-0000-000000000001', 'Neighborhood Guides',   'neighborhood-guides',   'In-depth video tours of Berlin''s unique neighborhoods, from Kreuzberg to Prenzlauer Berg.',                      1),
  ('60000000-0000-0000-0000-000000000002', 'Berlin Eats',           'berlin-eats',           'Exploring Berlin''s diverse food scene one restaurant, market, and street food stall at a time.',                  2),
  ('60000000-0000-0000-0000-000000000003', 'Expat Stories',         'expat-stories',         'Personal stories from Berlin''s international community -- why they came and why they stayed.',                    3),
  ('60000000-0000-0000-0000-000000000004', 'Hidden Berlin',         'hidden-berlin',         'Discovering the city''s secret spots, hidden courtyards, forgotten bunkers, and untold history.',                  4),
  ('60000000-0000-0000-0000-000000000005', 'Berlin Explained',      'berlin-explained',      'Making sense of German bureaucracy, cultural norms, and daily life for newcomers to Berlin.',                      5)
ON CONFLICT DO NOTHING;
```

---

## 11. Tags (Common Tags)

```sql
INSERT INTO tags (id, name, slug) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Street Art',          'street-art'),
  ('20000000-0000-0000-0000-000000000002', 'Berlin Wall',         'berlin-wall'),
  ('20000000-0000-0000-0000-000000000003', 'Craft Beer',          'craft-beer'),
  ('20000000-0000-0000-0000-000000000004', 'Vegan',               'vegan'),
  ('20000000-0000-0000-0000-000000000005', 'Techno',              'techno'),
  ('20000000-0000-0000-0000-000000000006', 'Christmas Markets',   'christmas-markets'),
  ('20000000-0000-0000-0000-000000000007', 'Museums',             'museums'),
  ('20000000-0000-0000-0000-000000000008', 'Free Things',         'free-things'),
  ('20000000-0000-0000-0000-000000000009', 'Startups',            'startups'),
  ('20000000-0000-0000-0000-000000000010', 'Public Transport',    'public-transport'),
  ('20000000-0000-0000-0000-000000000011', 'Parks & Gardens',     'parks-gardens'),
  ('20000000-0000-0000-0000-000000000012', 'Architecture',        'architecture'),
  ('20000000-0000-0000-0000-000000000013', 'Photography',         'photography'),
  ('20000000-0000-0000-0000-000000000014', 'Family',              'family'),
  ('20000000-0000-0000-0000-000000000015', 'Budget',              'budget'),
  ('20000000-0000-0000-0000-000000000016', 'Sustainability',      'sustainability'),
  ('20000000-0000-0000-0000-000000000017', 'LGBTQ+',              'lgbtq'),
  ('20000000-0000-0000-0000-000000000018', 'Vintage & Flea Markets', 'vintage-flea-markets'),
  ('20000000-0000-0000-0000-000000000019', 'Cycling',             'cycling'),
  ('20000000-0000-0000-0000-000000000020', 'Winter',              'winter'),
  ('20000000-0000-0000-0000-000000000021', 'Summer',              'summer'),
  ('20000000-0000-0000-0000-000000000022', 'Coworking',           'coworking'),
  ('20000000-0000-0000-0000-000000000023', 'Live Music',          'live-music'),
  ('20000000-0000-0000-0000-000000000024', 'Cinema',              'cinema'),
  ('20000000-0000-0000-0000-000000000025', 'Theater',             'theater')
ON CONFLICT DO NOTHING;
```

---

## Seed Script (TypeORM)

```typescript
// src/seeds/run-seeds.ts
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'iloveberlin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'iloveberlin',
  });

  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.startTransaction();

    // Read and execute seed SQL files in order
    const seedFiles = [
      'extensions.sql',
      'users.sql',
      'categories-article.sql',
      'categories-event.sql',
      'categories-video.sql',
      'guide-topics.sql',
      'cuisines.sql',
      'classified-categories.sql',
      'product-categories.sql',
      'video-series.sql',
      'tags.sql',
      'notification-preferences.sql',
    ];

    for (const file of seedFiles) {
      const sql = readFileSync(
        join(__dirname, 'sql', file),
        'utf-8'
      );
      await queryRunner.query(sql);
      console.log(`Seeded: ${file}`);
    }

    await queryRunner.commitTransaction();
    console.log('All seeds completed successfully.');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Seed failed, rolled back:', error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

runSeeds();
```

---

## Seed Data Summary

| Data Type | Count | Table |
|-----------|-------|-------|
| Admin user | 1 | `users` |
| Article categories | 12 | `categories` (type='article') |
| Event categories | 8 | `categories` (type='event') |
| Video categories | 5 | `categories` (type='video') |
| Guide topics | 8 | `guide_topics` |
| Cuisines | 30 | `cuisines` |
| Classified categories | 7 | `classified_categories` |
| Product categories | 5 | `product_categories` |
| Video series | 5 | `video_series` |
| Tags | 25 | `tags` |
| Notification preferences | 1 | `notification_preferences` |
| **Total reference rows** | **107** | |

---

## Development-Only Seeds

For development environments, additional sample content can be loaded after the reference data. See the individual schema documents for INSERT examples:

- [schema-users.md](./schema-users.md) -- test users (editor, regular user, unverified user)
- [schema-content.md](./schema-content.md) -- sample articles with tags and revisions
- [schema-guides.md](./schema-guides.md) -- sample guides (Blue Card, apartment hunting)
- [schema-events.md](./schema-events.md) -- sample venues and events
- [schema-dining.md](./schema-dining.md) -- sample restaurants with cuisines and offers
- [schema-videos.md](./schema-videos.md) -- sample videos in series
- [schema-competitions.md](./schema-competitions.md) -- sample competitions with entries
- [schema-classifieds.md](./schema-classifieds.md) -- sample classifieds with messages
- [schema-store.md](./schema-store.md) -- sample products, carts, and orders
- [schema-media.md](./schema-media.md) -- sample media records
- [schema-admin.md](./schema-admin.md) -- sample admin logs, homepage featured, ads
