import { QueryRunner, DataSource } from 'typeorm';

// ─── Berlin data pools ──────────────────────────────────────────────

export const BERLIN_DISTRICTS = [
  { name: 'Mitte', zip: '10115' },
  { name: 'Kreuzberg', zip: '10997' },
  { name: 'Neukoelln', zip: '12043' },
  { name: 'Prenzlauer Berg', zip: '10405' },
  { name: 'Friedrichshain', zip: '10243' },
  { name: 'Charlottenburg', zip: '10585' },
  { name: 'Schoeneberg', zip: '10823' },
  { name: 'Wedding', zip: '13347' },
  { name: 'Moabit', zip: '10551' },
  { name: 'Tempelhof', zip: '12099' },
  { name: 'Steglitz', zip: '12163' },
  { name: 'Pankow', zip: '13187' },
];

export const BERLIN_STREETS = [
  'Unter den Linden', 'Friedrichstrasse', 'Kurfuerstendamm', 'Oranienstrasse',
  'Karl-Marx-Allee', 'Torstrasse', 'Sonnenallee', 'Kastanienallee',
  'Warschauer Strasse', 'Kantstrasse', 'Bergmannstrasse', 'Greifswalder Strasse',
  'Schoenhauser Allee', 'Hermannstrasse', 'Turmstrasse', 'Badstrasse',
  'Brunnenstrasse', 'Danziger Strasse', 'Frankfurter Allee', 'Potsdamer Strasse',
  'Kottbusser Damm', 'Prenzlauer Allee', 'Muellerstrasse', 'Wilmersdorfer Strasse',
  'Bornholmer Strasse', 'Skalitzer Strasse', 'Invalidenstrasse', 'Chausseestrasse',
  'Revaler Strasse', 'Weserstrasse',
];

export const BERLIN_LANDMARKS = [
  'Brandenburg Gate', 'TV Tower', 'East Side Gallery', 'Reichstag',
  'Checkpoint Charlie', 'Museum Island', 'Berlin Cathedral', 'Tiergarten',
  'Alexanderplatz', 'Potsdamer Platz', 'Hackesche Hoefe', 'Berlin Wall Memorial',
  'Charlottenburg Palace', 'KaDeWe', 'Mauerpark', 'Tempelhofer Feld',
  'Oberbaumbruecke', 'Gendarmenmarkt', 'Grunewald', 'Spree River',
];

// ─── Utility functions ──────────────────────────────────────────────

export function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

export function generateAddress(index: number): string {
  const street = pick(BERLIN_STREETS, index);
  const num = (index % 120) + 1;
  const district = pick(BERLIN_DISTRICTS, index);
  return `${street} ${num}, ${district.zip} Berlin`;
}

export function generatePublishedAt(index: number): string {
  const monthsAgo = index % 12;
  const day = (index % 28) + 1;
  const date = new Date(2026, 2 - monthsAgo, day); // March 2026 base
  return date.toISOString();
}

export function generateFutureDate(index: number, baseMonthsOut: number): string {
  const month = (index % 6) + baseMonthsOut;
  const day = (index % 28) + 1;
  const date = new Date(2026, 2 + month, day);
  return date.toISOString().split('T')[0]; // date only
}

export function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

export function generateBody(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${escapeSQL(p)}</p>`).join('\n');
}

// ─── DB helpers ─────────────────────────────────────────────────────

export async function getAdminUserId(qr: QueryRunner): Promise<string> {
  const rows = await qr.query(
    `SELECT id FROM users WHERE email = 'admin@iloveberlin.biz' LIMIT 1`,
  );
  if (!rows.length) throw new Error('Admin user not found — run db:seed first');
  return rows[0].id;
}

export async function fetchSubcategories(
  qr: QueryRunner,
  type: string,
): Promise<Map<string, { id: string; name: string }>> {
  const rows = await qr.query(
    `SELECT c.id, c.slug, c.name FROM categories c
     WHERE c.type = '${type}' AND c.parent_id IS NOT NULL AND c.is_active = true
     ORDER BY c.display_order`,
  );
  const map = new Map<string, { id: string; name: string }>();
  for (const r of rows) map.set(r.slug, { id: r.id, name: r.name });
  return map;
}

export async function fetchRootCategories(
  qr: QueryRunner,
  type: string,
): Promise<Map<string, { id: string; name: string }>> {
  const rows = await qr.query(
    `SELECT c.id, c.slug, c.name FROM categories c
     WHERE c.type = '${type}' AND c.parent_id IS NULL AND c.is_active = true
     ORDER BY c.display_order`,
  );
  const map = new Map<string, { id: string; name: string }>();
  for (const r of rows) map.set(r.slug, { id: r.id, name: r.name });
  return map;
}

export async function fetchChildCuisines(
  qr: QueryRunner,
): Promise<Map<string, { id: string; name: string }>> {
  const rows = await qr.query(
    `SELECT c.id, c.slug, c.name FROM cuisines c
     WHERE c.parent_id IS NOT NULL
     ORDER BY c.sort_order`,
  );
  const map = new Map<string, { id: string; name: string }>();
  for (const r of rows) map.set(r.slug, { id: r.id, name: r.name });
  return map;
}

export async function fetchSubtopics(
  qr: QueryRunner,
): Promise<Map<string, { id: string; name: string }>> {
  const rows = await qr.query(
    `SELECT t.id, t.slug, t.name FROM guide_topics t
     WHERE t.parent_id IS NOT NULL
     ORDER BY t.sort_order`,
  );
  const map = new Map<string, { id: string; name: string }>();
  for (const r of rows) map.set(r.slug, { id: r.id, name: r.name });
  return map;
}

export async function fetchClassifiedLevel2Categories(
  qr: QueryRunner,
): Promise<Map<string, { id: string; name: string }>> {
  const rows = await qr.query(
    `SELECT c.id, c.slug, c.name FROM classified_categories c
     WHERE c.parent_id IN (SELECT id FROM classified_categories WHERE parent_id IS NULL)
     ORDER BY c.sort_order`,
  );
  const map = new Map<string, { id: string; name: string }>();
  for (const r of rows) map.set(r.slug, { id: r.id, name: r.name });
  return map;
}

export async function fetchProductSubcategories(
  qr: QueryRunner,
): Promise<Map<string, { id: string; name: string }>> {
  const rows = await qr.query(
    `SELECT c.id, c.slug, c.name FROM product_categories c
     WHERE c.parent_id IS NOT NULL
     ORDER BY c.sort_order`,
  );
  const map = new Map<string, { id: string; name: string }>();
  for (const r of rows) map.set(r.slug, { id: r.id, name: r.name });
  return map;
}

export async function contentAlreadySeeded(
  qr: QueryRunner,
  table: string,
  threshold = 5,
): Promise<boolean> {
  const rows = await qr.query(`SELECT COUNT(*)::int AS cnt FROM ${table}`);
  return rows[0].cnt >= threshold;
}

export async function fetchVenueIds(
  qr: QueryRunner,
): Promise<string[]> {
  const rows = await qr.query(`SELECT id FROM venues ORDER BY name`);
  return rows.map((r: { id: string }) => r.id);
}
