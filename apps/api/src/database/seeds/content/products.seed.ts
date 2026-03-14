import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import {
  BERLIN_DISTRICTS,
  BERLIN_LANDMARKS,
  pick,
  fetchProductSubcategories,
  contentAlreadySeeded,
} from './shared';

const NAME_TEMPLATES = [
  (sub: string, d: string) => `Berlin ${sub} - ${d} Edition`,
  (sub: string) => `I ♥ Berlin ${sub}`,
  (sub: string, d: string) => `${d} Inspired ${sub}`,
  (sub: string, _d: string, l: string) => `${l} ${sub}`,
  (sub: string) => `Classic Berlin ${sub}`,
  (sub: string, d: string) => `${sub} - ${d} Collection`,
  (sub: string) => `Berlin Bear ${sub}`,
  (sub: string, _d: string, l: string) => `${sub} featuring ${l}`,
  (sub: string, d: string) => `Premium ${sub} - ${d} Style`,
  (sub: string) => `Original Berlin ${sub}`,
];

function buildDescription(subName: string, district: string, landmark: string): string {
  return `Celebrate your love for Berlin with this ${subName} inspired by the character and charm of ${district}. `
    + `Featuring motifs from iconic locations like ${landmark}, this product captures the unique spirit of the German capital. `
    + `Perfect as a gift or a personal keepsake, this ${subName} is designed and produced in Berlin with attention to quality and detail.`;
}

function buildShortDescription(subName: string): string {
  return `A Berlin-themed ${subName} — designed with love in the German capital.`;
}

function generateSku(catAbbr: string, index: number): string {
  return `ILB-${catAbbr}-${String(index + 1).padStart(3, '0')}`;
}

// Abbreviation map built from first letters of category words
function abbreviate(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 4);
}

export async function seedProducts(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'products', 50)) {
    console.log('  Products already seeded, skipping.');
    await qr.release();
    return;
  }

  const subcats = await fetchProductSubcategories(qr);

  if (subcats.size === 0) {
    console.log('  No product subcategories found — run db:seed first.');
    await qr.release();
    return;
  }

  // Check which parent category is "Digital Products" for is_digital flag
  const digitalParentRows = await qr.query(
    `SELECT id FROM product_categories WHERE slug = 'digital-products' LIMIT 1`,
  );
  const digitalParentId = digitalParentRows.length > 0 ? digitalParentRows[0].id : null;
  const digitalCatIds = new Set<string>();
  if (digitalParentId) {
    const digitalKids = await qr.query(
      `SELECT id FROM product_categories WHERE parent_id = $1`,
      [digitalParentId],
    );
    for (const row of digitalKids) digitalCatIds.add(row.id);
  }

  await qr.startTransaction();
  try {
    const slugs = new Set<string>();
    const skus = new Set<string>();
    let count = 0;

    let subcatIdx = 0;
    for (const [, { id: catId, name: subName }] of subcats) {
      const abbr = abbreviate(subName);

      for (let i = 0; i < 10; i++) {
        const globalIdx = subcatIdx * 10 + i;
        const district = pick(BERLIN_DISTRICTS, globalIdx).name;
        const landmark = pick(BERLIN_LANDMARKS, globalIdx);

        const nameFn = pick(NAME_TEMPLATES, i);
        const name = nameFn(subName, district, landmark);

        let slug = generateSlug(name);
        if (slugs.has(slug)) slug = `${slug}-${globalIdx}`;
        slugs.add(slug);

        let sku = generateSku(abbr, globalIdx);
        if (skus.has(sku)) sku = `${sku}-${globalIdx}`;
        skus.add(sku);

        const description = buildDescription(subName, district, landmark);
        const shortDescription = buildShortDescription(subName);

        const basePrice = (4.99 + (globalIdx % 30) * 4.83).toFixed(2); // 4.99-149.99
        const compareAtPrice =
          globalIdx % 3 === 0
            ? (parseFloat(basePrice) * 1.2).toFixed(2)
            : null;

        const isFeatured = globalIdx % 10 === 0;
        const isDigital = digitalCatIds.has(catId);
        const stockQuantity = isDigital ? 9999 : (globalIdx % 19 + 1) * 10; // 10-200
        const sortOrder = i;

        await qr.query(
          `INSERT INTO products (name, slug, description, short_description, base_price, compare_at_price, sku, status, is_featured, is_digital, stock_quantity, category_id, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $11, $12)
           ON CONFLICT (slug) DO NOTHING`,
          [
            name, slug, description, shortDescription, basePrice, compareAtPrice,
            sku, isFeatured, isDigital, stockQuantity, catId, sortOrder,
          ],
        );
        count++;
      }
      subcatIdx++;
    }

    await qr.commitTransaction();
    console.log(`  Seeded ${count} products across ${subcats.size} subcategories.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
