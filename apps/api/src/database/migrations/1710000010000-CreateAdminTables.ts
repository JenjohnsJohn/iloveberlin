import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminTables1710000010000 implements MigrationInterface {
  name = 'CreateAdminTables1710000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create campaign status enum
    await queryRunner.query(`
      CREATE TYPE "campaign_status_enum" AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled')
    `);

    // Create ad position enum
    await queryRunner.query(`
      CREATE TYPE "ad_position_enum" AS ENUM ('homepage_banner', 'sidebar', 'article_inline', 'category_header', 'footer')
    `);

    // Create admin_activity_log table
    await queryRunner.query(`
      CREATE TABLE "admin_activity_log" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "action" character varying(255) NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" uuid,
        "details" jsonb,
        "ip_address" character varying(45),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_activity_log" PRIMARY KEY ("id"),
        CONSTRAINT "FK_admin_activity_log_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create ad_campaigns table
    await queryRunner.query(`
      CREATE TABLE "ad_campaigns" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "advertiser" character varying(255) NOT NULL,
        "status" "campaign_status_enum" NOT NULL DEFAULT 'draft',
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "budget" decimal(10,2),
        "impressions" integer NOT NULL DEFAULT 0,
        "clicks" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ad_campaigns" PRIMARY KEY ("id")
      )
    `);

    // Create ad_placements table
    await queryRunner.query(`
      CREATE TABLE "ad_placements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "campaign_id" uuid NOT NULL,
        "position" "ad_position_enum" NOT NULL,
        "image_url" character varying(500) NOT NULL,
        "link_url" character varying(500) NOT NULL,
        "alt_text" character varying(255) NOT NULL,
        "impressions" integer NOT NULL DEFAULT 0,
        "clicks" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ad_placements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ad_placements_campaign" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_admin_activity_log_user_id" ON "admin_activity_log" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_admin_activity_log_entity_type" ON "admin_activity_log" ("entity_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_admin_activity_log_created_at" ON "admin_activity_log" ("created_at")`);

    await queryRunner.query(`CREATE INDEX "IDX_ad_campaigns_status" ON "ad_campaigns" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_ad_campaigns_start_date" ON "ad_campaigns" ("start_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_ad_campaigns_end_date" ON "ad_campaigns" ("end_date")`);

    await queryRunner.query(`CREATE INDEX "IDX_ad_placements_campaign_id" ON "ad_placements" ("campaign_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_ad_placements_position" ON "ad_placements" ("position")`);
    await queryRunner.query(`CREATE INDEX "IDX_ad_placements_is_active" ON "ad_placements" ("is_active")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ad_placements"`);
    await queryRunner.query(`DROP TABLE "ad_campaigns"`);
    await queryRunner.query(`DROP TABLE "admin_activity_log"`);
    await queryRunner.query(`DROP TYPE "ad_position_enum"`);
    await queryRunner.query(`DROP TYPE "campaign_status_enum"`);
  }
}
