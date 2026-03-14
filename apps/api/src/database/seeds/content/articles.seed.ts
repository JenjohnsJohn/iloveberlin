import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_LANDMARKS,
  pick,
  generatePublishedAt,
  generateBody,
  escapeSQL,
  getAdminUserId,
  fetchSubcategories,
  contentAlreadySeeded,
} from './shared';

const TITLE_TEMPLATES = [
  (sub: string, d: string, _d2: string, _l: string) =>
    `${d}'s ${sub} Scene: What You Need to Know`,
  (sub: string, d: string) => `Inside Berlin: A Look at ${sub} in ${d}`,
  (sub: string) => `Why Berlin's ${sub} Is Changing in 2026`,
  (sub: string, d: string) =>
    `Top Things to Know About ${sub} in ${d}`,
  (sub: string, _d: string, _d2: string, l: string) =>
    `Discovering ${sub} Near ${l}`,
  (sub: string, d: string) =>
    `Meet the People Behind ${d}'s ${sub}`,
  (sub: string) => `${sub} in Berlin: What's New This Season`,
  (sub: string, d: string, d2: string) =>
    `${d} vs ${d2}: ${sub} Compared`,
  (sub: string) =>
    `How to Experience ${sub} Like a True Berliner`,
  (sub: string, d: string) =>
    `Why ${d}'s ${sub} Deserves More Attention`,
];

function buildBody(subName: string, district: string, landmark: string): string {
  return generateBody([
    `Berlin's ${subName} landscape continues to evolve, especially in ${district}. Whether you are a long-time resident or a newcomer, staying informed about ${subName} developments is essential for navigating life in the capital.`,
    `The area around ${landmark} has seen significant changes in recent months. Local residents have noticed a shift in how ${subName} initiatives are shaping daily life, from community programs to new businesses opening their doors.`,
    `Experts suggest that ${district} will remain a focal point for ${subName} activity throughout 2026. City planners and community leaders are working together to ensure that growth is sustainable and inclusive.`,
    `For those looking to get involved, there are numerous organizations in ${district} dedicated to ${subName}. From volunteer groups to professional associations, opportunities abound for people of all backgrounds.`,
    `As Berlin continues to grow as a global city, the intersection of ${subName} and daily life becomes ever more important. Staying connected to your neighborhood and its evolving character is one of the great pleasures of living here.`,
  ]);
}

export async function seedArticles(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'articles', 50)) {
    console.log('  Articles already seeded, skipping.');
    await qr.release();
    return;
  }

  const adminId = await getAdminUserId(qr);
  const subcats = await fetchSubcategories(qr, 'article');

  if (subcats.size === 0) {
    console.log('  No article subcategories found — run db:seed first.');
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
        const district2 = pick(BERLIN_DISTRICTS, globalIdx + 5).name;
        const landmark = pick(BERLIN_LANDMARKS, globalIdx);

        const titleFn = pick(TITLE_TEMPLATES, i);
        const title = titleFn(subName, district, district2, landmark);

        let slug = generateSlug(title);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const body = buildBody(subName, district, landmark);
        const excerpt = `An in-depth look at ${subName} in ${district}, Berlin.`;
        const publishedAt = generatePublishedAt(globalIdx);
        const readTime = (i % 6) + 3; // 3-8 minutes

        await qr.query(
          `INSERT INTO articles (title, slug, body, excerpt, category_id, author_id, status, published_at, read_time_minutes)
           VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, $8)
           ON CONFLICT (slug) DO NOTHING`,
          [title, slug, body, excerpt, catId, adminId, publishedAt, readTime],
        );
        count++;
      }
      subcatIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} articles across ${subcats.size} subcategories.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
