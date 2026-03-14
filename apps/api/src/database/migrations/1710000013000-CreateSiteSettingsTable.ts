import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSiteSettingsTable1710000013000 implements MigrationInterface {
  name = 'CreateSiteSettingsTable1710000013000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(
      `CREATE TYPE "setting_type_enum" AS ENUM ('string', 'text', 'number', 'boolean', 'json')`,
    );
    await queryRunner.query(
      `CREATE TYPE "setting_group_enum" AS ENUM ('general', 'seo', 'social', 'contact')`,
    );

    // Create site_settings table
    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" character varying(100) NOT NULL,
        "value" text,
        "type" "setting_type_enum" NOT NULL DEFAULT 'string',
        "group" "setting_group_enum" NOT NULL DEFAULT 'general',
        "label" character varying(255) NOT NULL,
        "description" text,
        "is_public" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_site_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_site_settings_key" UNIQUE ("key")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_site_settings_key" ON "site_settings" ("key")`);
    await queryRunner.query(`CREATE INDEX "IDX_site_settings_group" ON "site_settings" ("group")`);
    await queryRunner.query(`CREATE INDEX "IDX_site_settings_is_public" ON "site_settings" ("is_public")`);

    // Seed default settings
    await queryRunner.query(`
      INSERT INTO "site_settings" ("key", "value", "type", "group", "label", "description", "is_public") VALUES
        ('site_name', 'I ♥ Berlin', 'string', 'general', 'Site Name', 'The name of the website displayed in headers and titles', true),
        ('site_description', 'Your guide to Berlin - events, dining, culture and more', 'text', 'general', 'Site Description', 'A brief description of the website', true),
        ('site_logo_url', NULL, 'string', 'general', 'Site Logo URL', 'URL to the site logo image', true),
        ('contact_email', 'hello@iloveberlin.de', 'string', 'contact', 'Contact Email', 'Primary contact email address', true),
        ('contact_phone', NULL, 'string', 'contact', 'Contact Phone', 'Contact phone number', true),
        ('contact_address', 'Berlin, Germany', 'text', 'contact', 'Contact Address', 'Physical address or location', true),
        ('seo_title_suffix', '| I ♥ Berlin', 'string', 'seo', 'SEO Title Suffix', 'Appended to all page titles for SEO', false),
        ('seo_default_description', 'Discover the best of Berlin - events, restaurants, culture, and local guides', 'text', 'seo', 'Default Meta Description', 'Default meta description used when pages do not have their own', false),
        ('seo_default_keywords', 'Berlin, events, restaurants, culture, travel, guide', 'text', 'seo', 'Default Meta Keywords', 'Default meta keywords for SEO', false),
        ('social_facebook', NULL, 'string', 'social', 'Facebook URL', 'Facebook page or profile URL', true),
        ('social_instagram', NULL, 'string', 'social', 'Instagram URL', 'Instagram profile URL', true),
        ('social_twitter', NULL, 'string', 'social', 'Twitter / X URL', 'Twitter or X profile URL', true),
        ('social_youtube', NULL, 'string', 'social', 'YouTube URL', 'YouTube channel URL', true),
        ('social_tiktok', NULL, 'string', 'social', 'TikTok URL', 'TikTok profile URL', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "site_settings"`);
    await queryRunner.query(`DROP TYPE "setting_group_enum"`);
    await queryRunner.query(`DROP TYPE "setting_type_enum"`);
  }
}
