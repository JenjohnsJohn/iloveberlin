import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideosTables1710000006000 implements MigrationInterface {
  name = 'CreateVideosTables1710000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create video_series table
    await queryRunner.query(`
      CREATE TABLE "video_series" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "description" text,
        "thumbnail_id" uuid,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_video_series" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_video_series_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_video_series_thumbnail" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL
      )
    `);

    // Create video_provider enum
    await queryRunner.query(`
      CREATE TYPE "video_provider_enum" AS ENUM ('youtube', 'vimeo', 'other')
    `);

    // Create video_status enum
    await queryRunner.query(`
      CREATE TYPE "video_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    // Create videos table
    await queryRunner.query(`
      CREATE TABLE "videos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "slug" character varying(300) NOT NULL,
        "description" text,
        "video_url" character varying(500) NOT NULL,
        "video_provider" "video_provider_enum" NOT NULL DEFAULT 'youtube',
        "thumbnail_id" uuid,
        "series_id" uuid,
        "category_id" uuid,
        "duration_seconds" integer,
        "view_count" integer NOT NULL DEFAULT 0,
        "status" "video_status_enum" NOT NULL DEFAULT 'draft',
        "published_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_videos" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_videos_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_videos_thumbnail" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_videos_series" FOREIGN KEY ("series_id") REFERENCES "video_series"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_videos_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    // Create video_tags junction table
    await queryRunner.query(`
      CREATE TABLE "video_tags" (
        "video_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_video_tags" PRIMARY KEY ("video_id", "tag_id"),
        CONSTRAINT "FK_video_tags_video" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_video_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      )
    `);

    // Create homepage_featured table
    await queryRunner.query(`
      CREATE TABLE "homepage_featured" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "section" character varying(50) NOT NULL,
        "content_type" character varying(50) NOT NULL,
        "content_id" uuid NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_homepage_featured" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_video_series_slug" ON "video_series" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_videos_slug" ON "videos" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_videos_status" ON "videos" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_videos_series_id" ON "videos" ("series_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_videos_category_id" ON "videos" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_videos_published_at" ON "videos" ("published_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_video_tags_video_id" ON "video_tags" ("video_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_video_tags_tag_id" ON "video_tags" ("tag_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_homepage_featured_section" ON "homepage_featured" ("section")`);
    await queryRunner.query(`CREATE INDEX "IDX_homepage_featured_content" ON "homepage_featured" ("content_type", "content_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "homepage_featured"`);
    await queryRunner.query(`DROP TABLE "video_tags"`);
    await queryRunner.query(`DROP TABLE "videos"`);
    await queryRunner.query(`DROP TYPE "video_status_enum"`);
    await queryRunner.query(`DROP TYPE "video_provider_enum"`);
    await queryRunner.query(`DROP TABLE "video_series"`);
  }
}
