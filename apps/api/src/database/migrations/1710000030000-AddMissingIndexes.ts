import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingIndexes1710000030000 implements MigrationInterface {
  name = 'AddMissingIndexes1710000030000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── featured_image_id indexes ──────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_featured_image_id" ON "articles" ("featured_image_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_guides_featured_image_id" ON "guides" ("featured_image_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_events_featured_image_id" ON "events" ("featured_image_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_restaurants_featured_image_id" ON "restaurants" ("featured_image_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_videos_thumbnail_id" ON "videos" ("thumbnail_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_competitions_featured_image_id" ON "competitions" ("featured_image_id")`,
    );

    // ─── author_id indexes ──────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_author_id" ON "articles" ("author_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_guides_author_id" ON "guides" ("author_id")`,
    );

    // ─── approved_by index ──────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_events_approved_by" ON "events" ("approved_by")`,
    );

    // ─── category_id index on videos ────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_videos_category_id" ON "videos" ("category_id")`,
    );

    // ─── Composite indexes ──────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_status_published_at" ON "articles" ("status", "published_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_events_status_start_date" ON "events" ("status", "start_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_competitions_status_end_date" ON "competitions" ("status", "end_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ─── Drop composite indexes ─────────────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_competitions_status_end_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_events_status_start_date"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_articles_status_published_at"`,
    );

    // ─── Drop category_id index on videos ───────────────────
    // Note: this index may have existed before this migration;
    // the original CreateVideosTables migration already creates it.
    // Only drop if you are certain it was added here.

    // ─── Drop approved_by index ─────────────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_events_approved_by"`,
    );

    // ─── Drop author_id indexes ─────────────────────────────
    // Note: these indexes existed in the original create-table migrations.
    // We only drop the ones that are truly new from this migration.

    // ─── Drop featured_image_id indexes ─────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_competitions_featured_image_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_videos_thumbnail_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_restaurants_featured_image_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_events_featured_image_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_guides_featured_image_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_articles_featured_image_id"`,
    );
  }
}
