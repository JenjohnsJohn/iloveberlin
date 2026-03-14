import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  pick,
  generateAddress,
  getAdminUserId,
  fetchClassifiedLevel2Categories,
  contentAlreadySeeded,
} from './shared';

const TITLE_TEMPLATES = [
  (sub: string, d: string) => `${sub} Available in ${d}`,
  (sub: string) => `Great ${sub} - Berlin Pickup`,
  (sub: string, d: string) => `${d}: ${sub} for Sale`,
  (sub: string) => `Quality ${sub} - Must See`,
  (sub: string, d: string) => `${sub} in ${d} - Great Condition`,
  (sub: string) => `Berlin ${sub} - Priced to Sell`,
  (sub: string, d: string) => `${d} ${sub} Listing`,
  (sub: string) => `${sub} - Perfect for Berlin Life`,
  (sub: string, d: string) => `Affordable ${sub} in ${d}`,
  (sub: string) => `${sub} Available Now in Berlin`,
];

const PRICE_TYPES = ['fixed', 'negotiable', 'free', 'on_request'] as const;
const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'] as const;

function buildDescription(subName: string, district: string): string {
  return `This ${subName} listing is available in ${district}, Berlin. `
    + `Please contact for more details and to arrange a viewing. `
    + `Item is exactly as described and ready for immediate pickup or delivery within Berlin. `
    + `Serious inquiries only. Berlin-based buyers preferred.`;
}

export async function seedClassifieds(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'classifieds', 50)) {
    console.log('  Classifieds already seeded, skipping.');
    await qr.release();
    return;
  }

  const adminId = await getAdminUserId(qr);
  const level2Cats = await fetchClassifiedLevel2Categories(qr);

  if (level2Cats.size === 0) {
    console.log('  No classified level-2 categories found — run db:seed first.');
    await qr.release();
    return;
  }

  await qr.startTransaction();
  try {
    const slugs = new Set<string>();
    let count = 0;

    let catIdx = 0;
    for (const [, { id: catId, name: subName }] of level2Cats) {
      for (let i = 0; i < 10; i++) {
        const globalIdx = catIdx * 10 + i;
        const district = pick(BERLIN_DISTRICTS, globalIdx).name;

        const titleFn = pick(TITLE_TEMPLATES, i);
        const title = titleFn(subName, district);

        let slug = generateSlug(title);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const description = buildDescription(subName, district);
        const location = generateAddress(globalIdx);

        const priceType = pick(PRICE_TYPES, globalIdx);
        const price =
          priceType === 'free'
            ? null
            : ((globalIdx % 100) * 50 + 10).toFixed(2); // 10-5000

        // Services/jobs typically have no condition
        const isServiceOrJob =
          subName.toLowerCase().includes('service') ||
          subName.toLowerCase().includes('job') ||
          subName.toLowerCase().includes('tutoring');
        const condition = isServiceOrJob ? null : pick(CONDITIONS, globalIdx);

        await qr.query(
          `INSERT INTO classifieds (title, slug, description, price, price_type, condition, location, district, status, user_id, category_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10)
           ON CONFLICT (slug) DO NOTHING`,
          [
            title, slug, description, price, priceType, condition,
            location, district, adminId, catId,
          ],
        );
        count++;
      }
      catIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} classifieds across ${level2Cats.size} categories.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
