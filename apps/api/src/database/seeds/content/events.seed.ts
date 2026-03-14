import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_LANDMARKS,
  pick,
  generatePublishedAt,
  generateFutureDate,
  escapeSQL,
  fetchSubcategories,
  fetchVenueIds,
  contentAlreadySeeded,
} from './shared';

const TITLE_TEMPLATES = [
  (sub: string, d: string) => `${sub} Festival ${d} 2026`,
  (sub: string, _d: string, l: string) => `${sub} Night at ${l}`,
  (sub: string, d: string) => `${d} ${sub} Showcase`,
  (sub: string) => `Berlin ${sub} Open Air`,
  (sub: string, d: string) => `${sub} Meetup in ${d}`,
  (sub: string) => `International ${sub} Berlin`,
  (sub: string, d: string) => `${d} ${sub} Marathon`,
  (sub: string, _d: string, l: string) => `${sub} Exhibition near ${l}`,
  (sub: string, d: string) => `${sub} Workshop ${d}`,
  (sub: string) => `Berlin ${sub} Awards Night`,
];

function buildDescription(subName: string, district: string, landmark: string): string {
  return `Join us for an unforgettable ${subName} event in ${district}, Berlin. `
    + `Located near ${landmark}, this event brings together the best of Berlin's vibrant ${subName} scene. `
    + `Whether you are a seasoned enthusiast or curious newcomer, there is something for everyone. `
    + `Don't miss this chance to connect with the Berlin community and experience ${subName} at its finest.`;
}

export async function seedEvents(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'events', 50)) {
    console.log('  Events already seeded, skipping.');
    await qr.release();
    return;
  }

  const subcats = await fetchSubcategories(qr, 'event');
  const venueIds = await fetchVenueIds(qr);

  if (subcats.size === 0) {
    console.log('  No event subcategories found — run db:seed first.');
    await qr.release();
    return;
  }
  if (venueIds.length === 0) {
    console.log('  No venues found — seed venues first.');
    await qr.release();
    return;
  }

  await qr.startTransaction();
  try {
    const slugs = new Set<string>();
    let count = 0;

    let subcatIdx = 0;
    for (const [, { id: catId, name: subName }] of subcats) {
      for (let i = 0; i < 10; i++) {
        const globalIdx = subcatIdx * 10 + i;
        const district = pick(BERLIN_DISTRICTS, globalIdx).name;
        const landmark = pick(BERLIN_LANDMARKS, globalIdx);
        const venueId = pick(venueIds, globalIdx);

        const titleFn = pick(TITLE_TEMPLATES, i);
        const title = titleFn(subName, district, landmark);

        let slug = generateSlug(title);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const description = buildDescription(subName, district, landmark);
        const excerpt = `A ${subName} event in ${district}, Berlin.`;
        const publishedAt = generatePublishedAt(globalIdx);

        const startDate = generateFutureDate(globalIdx, 0);
        // ~20% multi-day events
        const endDate = i % 5 === 0 ? generateFutureDate(globalIdx, 1) : null;
        const startTime = `${((globalIdx % 12) + 10).toString().padStart(2, '0')}:00:00`;
        const endTime = `${((globalIdx % 5) + 18).toString().padStart(2, '0')}:00:00`;

        const isFree = i % 3 === 0;
        const price = isFree ? null : ((globalIdx % 16) * 5 + 5).toFixed(2);

        await qr.query(
          `INSERT INTO events (title, slug, description, excerpt, category_id, venue_id,
            start_date, end_date, start_time, end_time, is_free, price,
            status, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published', $13)
           ON CONFLICT (slug) DO NOTHING`,
          [
            title, slug, description, excerpt, catId, venueId,
            startDate, endDate, startTime, endTime, isFree, price,
            publishedAt,
          ],
        );
        count++;
      }
      subcatIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} events across ${subcats.size} subcategories.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
