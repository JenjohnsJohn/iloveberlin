import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesAndTags1710000001000 implements MigrationInterface {
  name = 'CreateCategoriesAndTags1710000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "description" text,
        "icon" character varying(50),
        "parent_id" uuid,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "type" character varying(50) NOT NULL DEFAULT 'article',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    // Create tags table
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_slug" UNIQUE ("slug")
      )
    `);

    // Create media table
    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "original_filename" character varying(255) NOT NULL,
        "storage_key" character varying(500) NOT NULL,
        "url" character varying(500) NOT NULL,
        "sizes" jsonb NOT NULL DEFAULT '{}',
        "mime_type" character varying(100) NOT NULL,
        "file_size_bytes" integer NOT NULL,
        "width" integer,
        "height" integer,
        "alt_text" character varying(500),
        "uploaded_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_media_uploaded_by" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_categories_slug" ON "categories" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_type" ON "categories" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_tags_slug" ON "tags" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_uploaded_by" ON "media" ("uploaded_by")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_mime_type" ON "media" ("mime_type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
