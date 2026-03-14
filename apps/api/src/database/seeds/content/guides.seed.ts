import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_LANDMARKS,
  pick,
  generatePublishedAt,
  escapeSQL,
  getAdminUserId,
  fetchSubtopics,
  contentAlreadySeeded,
} from './shared';

const TITLE_TEMPLATES = [
  (sub: string, d: string) => `Complete Guide to ${sub} in ${d}`,
  (sub: string) => `${sub} in Berlin: Everything You Need to Know`,
  (sub: string, d: string) => `${sub} Tips for Expats in ${d}`,
  (sub: string) => `Navigating ${sub} as a Newcomer to Berlin`,
  (sub: string, d: string) => `${d} Insider's Guide to ${sub}`,
  (sub: string) => `Step-by-Step: ${sub} in Berlin`,
  (sub: string, d: string) => `Essential ${sub} Resources in ${d}`,
  (sub: string) => `${sub} FAQ: What Every Berliner Should Know`,
  (sub: string, d: string) => `How ${d} Handles ${sub}`,
  (sub: string) => `Your First Year in Berlin: ${sub} Edition`,
];

function buildGuideBody(subName: string, district: string, landmark: string): string {
  const paragraphs = [
    `<h2>Overview</h2>`,
    `<p>Understanding ${subName} is an essential part of settling into life in Berlin. Whether you have just arrived or have been here for years, the landscape of ${subName} in ${district} and across the city is constantly evolving.</p>`,
    `<h2>Getting Started</h2>`,
    `<p>The first step in navigating ${subName} is knowing where to find reliable information. The Buergeramt offices in ${district} are often the starting point, but online portals have made many processes more accessible. We recommend starting early, as wait times can be significant.</p>`,
    `<ul>`,
    `<li>Visit the local Buergeramt in ${district} for in-person assistance</li>`,
    `<li>Check berlin.de for official online resources related to ${subName}</li>`,
    `<li>Join expat groups and forums for community advice</li>`,
    `<li>Consider professional consultation for complex cases</li>`,
    `</ul>`,
    `<h2>Key Considerations</h2>`,
    `<p>Berlin's approach to ${subName} differs from many other cities. The area around ${landmark} exemplifies how the city blends old and new approaches. Local regulations may vary by district, so what applies in ${district} might be handled differently in Charlottenburg or Mitte.</p>`,
    `<h3>Common Challenges</h3>`,
    `<p>Many newcomers find ${subName} overwhelming at first. Language barriers, bureaucratic processes, and different cultural expectations can all add complexity. However, Berlin's international community means support is readily available in multiple languages.</p>`,
    `<h2>Resources and Contacts</h2>`,
    `<p>For further assistance with ${subName}, the following resources are particularly useful for residents of ${district} and surrounding areas:</p>`,
    `<ul>`,
    `<li>Berlin Welcome Center near ${landmark}</li>`,
    `<li>Local community centers in ${district}</li>`,
    `<li>Online forums and Facebook groups for Berlin expats</li>`,
    `<li>Professional advisors specializing in ${subName}</li>`,
    `</ul>`,
    `<h2>Final Tips</h2>`,
    `<p>Patience is key when dealing with ${subName} in Berlin. The city rewards those who take the time to understand its systems. Stay organized, keep copies of all documents, and do not hesitate to ask for help from your community.</p>`,
  ];
  return paragraphs.join('\n');
}

export async function seedGuides(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'guides', 50)) {
    console.log('  Guides already seeded, skipping.');
    await qr.release();
    return;
  }

  const adminId = await getAdminUserId(qr);
  const subtopics = await fetchSubtopics(qr);

  if (subtopics.size === 0) {
    console.log('  No guide subtopics found — run db:seed first.');
    await qr.release();
    return;
  }

  await qr.startTransaction();
  try {
    const slugs = new Set<string>();
    let count = 0;

    let topicIdx = 0;
    for (const [, { id: topicId, name: subName }] of subtopics) {
      for (let i = 0; i < 10; i++) {
        const globalIdx = topicIdx * 10 + i;
        const district = pick(BERLIN_DISTRICTS, globalIdx).name;
        const landmark = pick(BERLIN_LANDMARKS, globalIdx);

        const titleFn = pick(TITLE_TEMPLATES, i);
        const title = titleFn(subName, district);

        let slug = generateSlug(title);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        const body = buildGuideBody(subName, district, landmark);
        const excerpt = `A comprehensive guide to ${subName} for Berlin residents and newcomers in ${district}.`;
        const publishedAt = generatePublishedAt(globalIdx);

        await qr.query(
          `INSERT INTO guides (title, slug, body, excerpt, topic_id, author_id, status, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'published', $7)
           ON CONFLICT (slug) DO NOTHING`,
          [title, slug, body, excerpt, topicId, adminId, publishedAt],
        );
        count++;
      }
      topicIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} guides across ${subtopics.size} subtopics.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
