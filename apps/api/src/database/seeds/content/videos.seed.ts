import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_LANDMARKS,
  pick,
  generatePublishedAt,
  fetchSubcategories,
  contentAlreadySeeded,
} from './shared';

const TITLE_TEMPLATES = [
  (sub: string, d: string) => `${sub} in ${d}: A Video Tour`,
  (sub: string, _d: string, l: string) => `Exploring ${sub} Near ${l}`,
  (sub: string, d: string) => `${d}'s Best ${sub} Moments`,
  (sub: string) => `Berlin ${sub}: Behind the Scenes`,
  (sub: string, d: string) => `A Day of ${sub} in ${d}`,
  (sub: string) => `Why Berlin's ${sub} Is Unique`,
  (sub: string, d: string) => `${sub} Highlights from ${d}`,
  (sub: string, _d: string, l: string) => `${sub} at ${l}: The Full Story`,
  (sub: string, d: string) => `${d} ${sub} Documentary Short`,
  (sub: string) => `${sub} in Berlin: Voices from the Community`,
];

// Use a set of placeholder YouTube URLs (different video IDs for variety)
const VIDEO_IDS = [
  'dQw4w9WgXcQ', '9bZkp7q19f0', 'JGwWNGJdvx8', 'kJQP7kiw5Fk',
  'RgKAFK5djSk', 'OPf0YbXqDm0', 'fJ9rUzIMcZQ', 'YQHsXMglC9A',
  'hT_nvWreIhg', 'CevxZvSJLk8',
];

function buildDescription(subName: string, district: string, landmark: string): string {
  return `Take a visual journey through Berlin's ${subName} scene in ${district}. `
    + `This video captures the energy and spirit of the community near ${landmark}, `
    + `featuring interviews with locals, stunning footage of the neighborhood, `
    + `and an insider perspective on what makes ${subName} in Berlin so special.`;
}

export async function seedVideos(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'videos', 50)) {
    console.log('  Videos already seeded, skipping.');
    await qr.release();
    return;
  }

  const subcats = await fetchSubcategories(qr, 'video');

  if (subcats.size === 0) {
    console.log('  No video subcategories found — run db:seed first.');
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

        const titleFn = pick(TITLE_TEMPLATES, i);
        const title = titleFn(subName, district, landmark);

        let slug = generateSlug(title);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const description = buildDescription(subName, district, landmark);
        const videoId = pick(VIDEO_IDS, globalIdx);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const durationSeconds = 120 + (globalIdx % 28) * 60; // 120-1800 seconds
        const publishedAt = generatePublishedAt(globalIdx);

        await qr.query(
          `INSERT INTO videos (title, slug, description, video_url, video_provider, category_id, duration_seconds, status, published_at)
           VALUES ($1, $2, $3, $4, 'youtube', $5, $6, 'published', $7)
           ON CONFLICT (slug) DO NOTHING`,
          [title, slug, description, videoUrl, catId, durationSeconds, publishedAt],
        );
        count++;
      }
      subcatIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} videos across ${subcats.size} subcategories.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
