/**
 * One-time migration script: uploads existing media files to Cloudflare R2
 * and updates database URLs.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/media/scripts/migrate-to-r2.ts
 *
 * Required env vars:
 *   DATABASE_URL, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, R2_PUBLIC_URL
 *
 * Optional:
 *   SOURCE_BASE_URL  — base URL to download existing images from
 *                      (default: https://api.iloveberlin.biz/uploads)
 *   DRY_RUN=true     — log what would happen without making changes
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { DataSource } from 'typeorm';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const SOURCE_BASE_URL =
  process.env.SOURCE_BASE_URL || 'https://api.iloveberlin.biz/uploads';
const DRY_RUN = process.env.DRY_RUN === 'true';

if (
  !DATABASE_URL ||
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL
) {
  console.error('Missing required env vars. See script header for details.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToR2(key: string, data: Buffer): Promise<void> {
  const ext = path.extname(key).toLowerCase();
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: CONTENT_TYPES[ext] || 'application/octet-stream',
    }),
  );
}

async function downloadFile(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`  ⚠ Download failed (${response.status}): ${url}`);
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.warn(`  ⚠ Download error: ${url} — ${error}`);
    return null;
  }
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== MIGRATING TO R2 ===');

  const ds = new DataSource({
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: false,
  });
  await ds.initialize();

  const rows: Array<{
    id: string;
    storage_key: string;
    url: string;
    sizes: Record<string, unknown>;
  }> = await ds.query('SELECT id, storage_key, url, sizes FROM media ORDER BY created_at');

  console.log(`Found ${rows.length} media records.\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const { id, storage_key, sizes } = row;
    console.log(`[${migrated + skipped + failed + 1}/${rows.length}] ${storage_key}`);

    // Skip if URL already points to R2
    if (row.url.startsWith(R2_PUBLIC_URL!)) {
      console.log('  → Already on R2, skipping');
      skipped++;
      continue;
    }

    // 1. Upload main file
    const alreadyInR2 = await objectExists(storage_key);
    if (alreadyInR2) {
      console.log('  → Object exists in R2');
    } else {
      const sourceUrl = `${SOURCE_BASE_URL}/${storage_key}`;
      const data = await downloadFile(sourceUrl);
      if (!data) {
        console.log('  ✗ Could not download, skipping');
        failed++;
        continue;
      }

      if (!DRY_RUN) {
        await uploadToR2(storage_key, data);
        console.log(`  ✓ Uploaded (${(data.length / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`  [dry-run] Would upload (${(data.length / 1024).toFixed(1)} KB)`);
      }
    }

    // 2. Upload thumbnail if it exists
    const thumbUrl = sizes?.thumbnail as string | undefined;
    if (thumbUrl && !thumbUrl.startsWith(R2_PUBLIC_URL!)) {
      // Extract thumbnail key from URL (e.g. ".../thumbs/uuid_thumb.jpg")
      const thumbMatch = thumbUrl.match(/\/(thumbs\/[^/]+)$/);
      if (thumbMatch) {
        const thumbKey = thumbMatch[1];
        const thumbExists = await objectExists(thumbKey);
        if (!thumbExists) {
          const thumbData = await downloadFile(thumbUrl);
          if (thumbData && !DRY_RUN) {
            await uploadToR2(thumbKey, thumbData);
            console.log(`  ✓ Thumbnail uploaded`);
          }
        }

        if (!DRY_RUN) {
          const newThumbUrl = `${R2_PUBLIC_URL}/${thumbKey}`;
          const newSizes = { ...sizes, thumbnail: newThumbUrl };
          await ds.query('UPDATE media SET sizes = $1 WHERE id = $2', [
            JSON.stringify(newSizes),
            id,
          ]);
        }
      }
    }

    // 3. Update URL in database
    const newUrl = `${R2_PUBLIC_URL}/${storage_key}`;
    if (!DRY_RUN) {
      await ds.query('UPDATE media SET url = $1 WHERE id = $2', [newUrl, id]);
    }

    migrated++;
    console.log(`  ✓ DB updated → ${R2_PUBLIC_URL}/${storage_key}`);
  }

  await ds.destroy();

  console.log(`\n=== DONE ===`);
  console.log(`Migrated: ${migrated}  Skipped: ${skipped}  Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
