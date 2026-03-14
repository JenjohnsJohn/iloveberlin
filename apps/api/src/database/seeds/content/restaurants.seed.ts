import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_STREETS,
  pick,
  escapeSQL,
  fetchChildCuisines,
  contentAlreadySeeded,
  generateAddress,
} from './shared';

const NAME_TEMPLATES = [
  (c: string, d: string) => `${c} Kitchen ${d}`,
  (c: string, d: string) => `${d} ${c} Bistro`,
  (c: string) => `Zum ${c} Haus`,
  (c: string, d: string) => `${c} Corner ${d}`,
  (c: string) => `Berlin ${c} Lounge`,
  (c: string, d: string) => `${d} ${c} Garden`,
  (c: string) => `Little ${c} Berlin`,
  (c: string, d: string) => `The ${c} Table ${d}`,
  (c: string) => `${c} & Friends`,
  (c: string, d: string) => `${d} ${c} Spot`,
];

const PRICE_RANGES = ['budget', 'moderate', 'upscale', 'fine_dining'] as const;

const OPENING_HOURS = JSON.stringify({
  Monday: '11:00 - 22:00',
  Tuesday: '11:00 - 22:00',
  Wednesday: '11:00 - 22:00',
  Thursday: '11:00 - 23:00',
  Friday: '11:00 - 00:00',
  Saturday: '10:00 - 00:00',
  Sunday: '10:00 - 21:00',
});

function buildDescription(cuisineName: string, district: string): string {
  return `Experience authentic ${cuisineName} cuisine in the heart of ${district}, Berlin. `
    + `Our restaurant blends traditional recipes with modern Berlin flair, using locally sourced ingredients wherever possible. `
    + `Whether you are dropping by for a quick lunch or settling in for a leisurely dinner, our welcoming atmosphere and carefully crafted menu will make your visit memorable. `
    + `Reservations recommended on weekends.`;
}

export async function seedRestaurants(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'restaurants', 50)) {
    console.log('  Restaurants already seeded, skipping.');
    await qr.release();
    return;
  }

  const cuisines = await fetchChildCuisines(qr);

  if (cuisines.size === 0) {
    console.log('  No child cuisines found — run db:seed first.');
    await qr.release();
    return;
  }

  await qr.startTransaction();
  try {
    const slugs = new Set<string>();
    let count = 0;

    let cuisineIdx = 0;
    for (const [, { id: cuisineId, name: cuisineName }] of cuisines) {
      for (let i = 0; i < 10; i++) {
        const globalIdx = cuisineIdx * 10 + i;
        const district = pick(BERLIN_DISTRICTS, globalIdx).name;

        const nameFn = pick(NAME_TEMPLATES, i);
        const name = nameFn(cuisineName, district);

        let slug = generateSlug(name);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const description = buildDescription(cuisineName, district);
        const address = generateAddress(globalIdx);
        const priceRange = pick(PRICE_RANGES, globalIdx);
        const rating = (3.0 + (globalIdx % 21) / 10).toFixed(1); // 3.0 - 5.0

        // Insert restaurant
        const result = await qr.query(
          `INSERT INTO restaurants (name, slug, description, address, district, price_range, rating, opening_hours, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published')
           ON CONFLICT (slug) DO NOTHING
           RETURNING id`,
          [name, slug, description, address, district, priceRange, rating, OPENING_HOURS],
        );

        // Insert junction row
        if (result.length > 0) {
          const restaurantId = result[0].id;
          await qr.query(
            `INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [restaurantId, cuisineId],
          );
        }

        count++;
      }
      cuisineIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} restaurants across ${cuisines.size} cuisines.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
