import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeAndConstraints1710000031000
  implements MigrationInterface
{
  name = 'AddCascadeAndConstraints1710000031000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ═══════════════════════════════════════════════════════════
    // 1. Ensure CASCADE DELETE on junction-table foreign keys
    // ═══════════════════════════════════════════════════════════

    // ─── article_tags ──────────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_article_tags_article"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_article"
         FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_article_tags_tag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_tag"
         FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE`,
    );

    // ─── restaurant_cuisines ───────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" DROP CONSTRAINT "FK_restaurant_cuisines_restaurant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" ADD CONSTRAINT "FK_restaurant_cuisines_restaurant"
         FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" DROP CONSTRAINT "FK_restaurant_cuisines_cuisine"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" ADD CONSTRAINT "FK_restaurant_cuisines_cuisine"
         FOREIGN KEY ("cuisine_id") REFERENCES "cuisines"("id") ON DELETE CASCADE`,
    );

    // ═══════════════════════════════════════════════════════════
    // 2. Add missing columns (entity ↔ schema drift)
    // ═══════════════════════════════════════════════════════════

    // events.view_count — entity has default 0
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "view_count" integer NOT NULL DEFAULT 0`,
    );

    // events.published_at — entity has nullable timestamptz
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP WITH TIME ZONE`,
    );

    // Add 'cancelled' value to event_status_enum (entity declares it)
    await queryRunner.query(
      `ALTER TYPE "event_status_enum" ADD VALUE IF NOT EXISTS 'cancelled'`,
    );

    // ═══════════════════════════════════════════════════════════
    // 3. Add unique constraint on cart_items (cart_id, product_id, variant_id)
    //    to prevent duplicate line items in a cart
    // ═══════════════════════════════════════════════════════════
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "UQ_cart_items_cart_product_variant"
         UNIQUE ("cart_id", "product_id", "variant_id")`,
    );

    // ═══════════════════════════════════════════════════════════
    // 4. Add missing indexes on FK columns
    // ═══════════════════════════════════════════════════════════

    // ─── article_revisions ─────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_article_revisions_article_id" ON "article_revisions" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_article_revisions_edited_by" ON "article_revisions" ("edited_by")`,
    );

    // ─── cart_items (product_id, variant_id) ───────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cart_items_product_id" ON "cart_items" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_cart_items_variant_id" ON "cart_items" ("variant_id")`,
    );

    // ─── order_items (product_id, variant_id) ──────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_items_product_id" ON "order_items" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_order_items_variant_id" ON "order_items" ("variant_id")`,
    );

    // ─── restaurant_images (media_id) ──────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_restaurant_images_media_id" ON "restaurant_images" ("media_id")`,
    );

    // ─── events.published_at ───────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_events_published_at" ON "events" ("published_at")`,
    );

    // ─── events.view_count ─────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_events_view_count" ON "events" ("view_count")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ─── Drop indexes added in up() ────────────────────────────
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_events_view_count"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_events_published_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_restaurant_images_media_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_order_items_variant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_order_items_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cart_items_variant_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cart_items_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_article_revisions_edited_by"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_article_revisions_article_id"`,
    );

    // ─── Drop unique constraint on cart_items ──────────────────
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "UQ_cart_items_cart_product_variant"`,
    );

    // ─── Note: cannot remove enum value 'cancelled' from
    //     event_status_enum in PostgreSQL without recreating
    //     the type. Leaving it in place is safe. ────────────────

    // ─── Drop added columns ────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN IF EXISTS "published_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN IF EXISTS "view_count"`,
    );

    // ─── Restore original FK constraints (already CASCADE, so
    //     this is a no-op in practice but keeps down() symmetric) ─
    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" DROP CONSTRAINT "FK_restaurant_cuisines_cuisine"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" ADD CONSTRAINT "FK_restaurant_cuisines_cuisine"
         FOREIGN KEY ("cuisine_id") REFERENCES "cuisines"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" DROP CONSTRAINT "FK_restaurant_cuisines_restaurant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "restaurant_cuisines" ADD CONSTRAINT "FK_restaurant_cuisines_restaurant"
         FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_article_tags_tag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_tag"
         FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_article_tags_article"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_article_tags_article"
         FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE`,
    );
  }
}
