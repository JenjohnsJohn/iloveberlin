import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_LANDMARKS,
  pick,
  fetchRootCategories,
  contentAlreadySeeded,
} from './shared';

const TITLE_TEMPLATES = [
  (sub: string, d: string) => `${d} ${sub} Challenge 2026`,
  (sub: string) => `Berlin ${sub} Competition: Spring Edition`,
  (sub: string, _d: string, l: string) => `${sub} Contest at ${l}`,
  (sub: string, d: string) => `${sub} Showdown: ${d} Edition`,
  (sub: string) => `ILOVEBERLIN ${sub} Awards`,
  (sub: string, d: string) => `${d} ${sub} Talent Search`,
  (sub: string) => `Best of Berlin ${sub} 2026`,
  (sub: string, _d: string, l: string) => `${sub} Battle near ${l}`,
  (sub: string, d: string) => `The Great ${d} ${sub} Contest`,
  (sub: string) => `Berlin Community ${sub} Competition`,
];

const PRIZE_TEMPLATES = [
  (sub: string) => `Win a ${sub} masterclass with a Berlin professional, plus a gift package worth 200 EUR.`,
  (sub: string) => `First place receives a 500 EUR voucher for ${sub} equipment and a feature on ILOVEBERLIN.`,
  (sub: string) => `The winner gets a VIP ${sub} experience in Berlin, including dinner for two and event tickets.`,
  () => `Grand prize: 1,000 EUR cash plus a feature article on iloveberlin.biz.`,
  (sub: string) => `Top 3 entries win ${sub} supplies, Berlin merchandise packs, and gift cards worth up to 300 EUR.`,
];

function buildDescription(subName: string, district: string, landmark: string): string {
  return `Show off your ${subName} skills in this exciting Berlin competition! `
    + `Open to all residents and visitors, this contest celebrates the creativity and talent of Berlin's diverse community. `
    + `Inspired by the vibrant scene in ${district} near ${landmark}, `
    + `participants are encouraged to submit their best work for a chance to win amazing prizes. `
    + `All entries will be judged by a panel of Berlin-based ${subName} professionals.`;
}

export async function seedCompetitions(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'competitions', 10)) {
    console.log('  Competitions already seeded, skipping.');
    await qr.release();
    return;
  }

  // Competition categories are flat (no children)
  const cats = await fetchRootCategories(qr, 'competition');

  if (cats.size === 0) {
    console.log('  No competition categories found — run db:seed first.');
    await qr.release();
    return;
  }

  await qr.startTransaction();
  try {
    const slugs = new Set<string>();
    let count = 0;

    let catIdx = 0;
    for (const [, { id: catId, name: subName }] of cats) {
      for (let i = 0; i < 10; i++) {
        const globalIdx = catIdx * 10 + i;
        const district = pick(BERLIN_DISTRICTS, globalIdx).name;
        const landmark = pick(BERLIN_LANDMARKS, globalIdx);

        const titleFn = pick(TITLE_TEMPLATES, i);
        const title = titleFn(subName, district, landmark);

        let slug = generateSlug(title);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const description = buildDescription(subName, district, landmark);
        const prizeFn = pick(PRIZE_TEMPLATES, globalIdx);
        const prizeDescription = prizeFn(subName);

        // Start 1-3 months ago, end 1-3 months in future
        const monthsAgo = (i % 3) + 1;
        const monthsAhead = (i % 3) + 1;
        const startDate = new Date(2026, 2 - monthsAgo, (i % 28) + 1);
        const endDate = new Date(2026, 2 + monthsAhead, (i % 28) + 1);

        const maxEntries = i % 3 === 0 ? null : ((globalIdx % 10) + 1) * 50; // 50-500 or null

        await qr.query(
          `INSERT INTO competitions (title, slug, description, prize_description, start_date, end_date, status, max_entries, category_id)
           VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8)
           ON CONFLICT (slug) DO NOTHING`,
          [title, slug, description, prizeDescription, startDate.toISOString(), endDate.toISOString(), maxEntries, catId],
        );
        count++;
      }
      catIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} competitions across ${cats.size} categories.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
