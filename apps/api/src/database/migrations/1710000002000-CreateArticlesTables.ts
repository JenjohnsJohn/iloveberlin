import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesTables1710000002000 implements MigrationInterface {
  name = 'CreateArticlesTables1710000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create article status enum
    await queryRunner.query(`
      CREATE TYPE "article_status_enum" AS ENUM ('draft', 'in_review', 'scheduled', 'published', 'archived')
    `);

    // Create articles table
    await queryRunner.query(`
      CREATE TABLE "articles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "subtitle" character varying(255),
        "slug" character varying(300) NOT NULL,
        "body" text NOT NULL,
        "excerpt" text,
        "featured_image_id" uuid,
        "category_id" uuid,
        "author_id" uuid NOT NULL,
        "status" "article_status_enum" NOT NULL DEFAULT 'draft',
        "published_at" TIMESTAMP WITH TIME ZONE,
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "view_count" integer NOT NULL DEFAULT 0,
        "read_time_minutes" integer NOT NULL DEFAULT 1,
        "seo_title" character varying(255),
        "seo_description" character varying(500),
        "seo_keywords" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_articles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_articles_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_articles_featured_image" FOREIGN KEY ("featured_image_id") REFERENCES "media"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_articles_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_articles_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create article_tags junction table
    await queryRunner.query(`
      CREATE TABLE "article_tags" (
        "article_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_article_tags" PRIMARY KEY ("article_id", "tag_id"),
        CONSTRAINT "FK_article_tags_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_article_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      )
    `);

    // Create article_revisions table
    await queryRunner.query(`
      CREATE TABLE "article_revisions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "article_id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "body" text NOT NULL,
        "edited_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_article_revisions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_article_revisions_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_article_revisions_editor" FOREIGN KEY ("edited_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create user_bookmarks table
    await queryRunner.query(`
      CREATE TABLE "user_bookmarks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "bookmarkable_type" character varying(50) NOT NULL,
        "bookmarkable_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_bookmarks" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_bookmarks_unique" UNIQUE ("user_id", "bookmarkable_type", "bookmarkable_id"),
        CONSTRAINT "FK_user_bookmarks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes on articles
    await queryRunner.query(`CREATE INDEX "IDX_articles_slug" ON "articles" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_articles_category_id" ON "articles" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_articles_author_id" ON "articles" ("author_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_articles_status" ON "articles" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_articles_published_at" ON "articles" ("published_at")`);

    // Create indexes on article_tags
    await queryRunner.query(`CREATE INDEX "IDX_article_tags_article_id" ON "article_tags" ("article_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_article_tags_tag_id" ON "article_tags" ("tag_id")`);

    // Create indexes on user_bookmarks
    await queryRunner.query(`CREATE INDEX "IDX_user_bookmarks_user_id" ON "user_bookmarks" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_bookmarks_type_id" ON "user_bookmarks" ("bookmarkable_type", "bookmarkable_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_bookmarks"`);
    await queryRunner.query(`DROP TABLE "article_revisions"`);
    await queryRunner.query(`DROP TABLE "article_tags"`);
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(`DROP TYPE "article_status_enum"`);
  }
}
