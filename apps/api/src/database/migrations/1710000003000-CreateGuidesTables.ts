import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGuidesTables1710000003000 implements MigrationInterface {
  name = 'CreateGuidesTables1710000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create guide_topics table
    await queryRunner.query(`
      CREATE TABLE "guide_topics" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "description" text,
        "icon" character varying(50),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_guide_topics" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_guide_topics_slug" UNIQUE ("slug")
      )
    `);

    // Create guide status enum
    await queryRunner.query(`
      CREATE TYPE "guide_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    // Create guides table
    await queryRunner.query(`
      CREATE TABLE "guides" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "topic_id" uuid,
        "title" character varying(255) NOT NULL,
        "slug" character varying(300) NOT NULL,
        "body" text NOT NULL,
        "excerpt" text,
        "featured_image_id" uuid,
        "author_id" uuid NOT NULL,
        "status" "guide_status_enum" NOT NULL DEFAULT 'draft',
        "last_reviewed_at" TIMESTAMP WITH TIME ZONE,
        "seo_title" character varying(255),
        "seo_description" character varying(500),
        "published_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_guides" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_guides_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_guides_topic" FOREIGN KEY ("topic_id") REFERENCES "guide_topics"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_guides_featured_image" FOREIGN KEY ("featured_image_id") REFERENCES "media"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_guides_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes on guide_topics
    await queryRunner.query(`CREATE INDEX "IDX_guide_topics_slug" ON "guide_topics" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_guide_topics_sort_order" ON "guide_topics" ("sort_order")`);

    // Create indexes on guides
    await queryRunner.query(`CREATE INDEX "IDX_guides_slug" ON "guides" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_guides_topic_id" ON "guides" ("topic_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_guides_author_id" ON "guides" ("author_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_guides_status" ON "guides" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_guides_published_at" ON "guides" ("published_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "guides"`);
    await queryRunner.query(`DROP TYPE "guide_status_enum"`);
    await queryRunner.query(`DROP TABLE "guide_topics"`);
  }
}
