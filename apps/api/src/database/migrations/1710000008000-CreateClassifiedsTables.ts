import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassifiedsTables1710000008000 implements MigrationInterface {
  name = 'CreateClassifiedsTables1710000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "classified_price_type_enum" AS ENUM ('fixed', 'negotiable', 'free', 'on_request')
    `);

    await queryRunner.query(`
      CREATE TYPE "classified_condition_enum" AS ENUM ('new', 'like_new', 'good', 'fair', 'poor')
    `);

    await queryRunner.query(`
      CREATE TYPE "classified_status_enum" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'active', 'expired', 'sold', 'deleted')
    `);

    await queryRunner.query(`
      CREATE TYPE "classified_report_reason_enum" AS ENUM ('spam', 'prohibited', 'fraud', 'offensive', 'other')
    `);

    await queryRunner.query(`
      CREATE TYPE "classified_report_status_enum" AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed')
    `);

    // Create classified_categories table
    await queryRunner.query(`
      CREATE TABLE "classified_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(150) NOT NULL,
        "description" text,
        "icon" character varying(100),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_classified_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_classified_categories_slug" UNIQUE ("slug")
      )
    `);

    // Create classifieds table
    await queryRunner.query(`
      CREATE TABLE "classifieds" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "slug" character varying(300) NOT NULL,
        "description" text NOT NULL,
        "price" decimal(10,2),
        "price_type" "classified_price_type_enum" NOT NULL DEFAULT 'fixed',
        "condition" "classified_condition_enum",
        "location" character varying(255),
        "district" character varying(100),
        "status" "classified_status_enum" NOT NULL DEFAULT 'draft',
        "moderator_notes" text,
        "featured" boolean NOT NULL DEFAULT false,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "view_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_classifieds" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_classifieds_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_classifieds_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_classifieds_category" FOREIGN KEY ("category_id") REFERENCES "classified_categories"("id") ON DELETE RESTRICT
      )
    `);

    // Create classified_images table
    await queryRunner.query(`
      CREATE TABLE "classified_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "classified_id" uuid NOT NULL,
        "url" character varying(500) NOT NULL,
        "thumbnail_url" character varying(500),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_classified_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_classified_images_classified" FOREIGN KEY ("classified_id") REFERENCES "classifieds"("id") ON DELETE CASCADE
      )
    `);

    // Create classified_messages table
    await queryRunner.query(`
      CREATE TABLE "classified_messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "classified_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "recipient_id" uuid NOT NULL,
        "message" text NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_classified_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_classified_messages_classified" FOREIGN KEY ("classified_id") REFERENCES "classifieds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_classified_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_classified_messages_recipient" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create classified_reports table
    await queryRunner.query(`
      CREATE TABLE "classified_reports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "classified_id" uuid NOT NULL,
        "reporter_id" uuid NOT NULL,
        "reason" "classified_report_reason_enum" NOT NULL,
        "description" text,
        "status" "classified_report_status_enum" NOT NULL DEFAULT 'pending',
        "admin_notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_classified_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_classified_reports_classified" FOREIGN KEY ("classified_id") REFERENCES "classifieds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_classified_reports_reporter" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_slug" ON "classifieds" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_user_id" ON "classifieds" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_category_id" ON "classifieds" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_status" ON "classifieds" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_district" ON "classifieds" ("district")`);
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_expires_at" ON "classifieds" ("expires_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_classifieds_featured" ON "classifieds" ("featured")`);
    await queryRunner.query(`CREATE INDEX "IDX_classified_images_classified_id" ON "classified_images" ("classified_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classified_messages_classified_id" ON "classified_messages" ("classified_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classified_messages_sender_id" ON "classified_messages" ("sender_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classified_messages_recipient_id" ON "classified_messages" ("recipient_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classified_reports_classified_id" ON "classified_reports" ("classified_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_classified_reports_status" ON "classified_reports" ("status")`);

    // Seed 7 categories
    await queryRunner.query(`
      INSERT INTO "classified_categories" ("name", "slug", "description", "icon", "sort_order") VALUES
      ('Vehicles', 'vehicles', 'Cars, motorcycles, bicycles and other vehicles', 'car', 1),
      ('Services', 'services', 'Professional and personal services', 'wrench', 2),
      ('Property', 'property', 'Apartments, rooms, and commercial spaces', 'home', 3),
      ('Electronics', 'electronics', 'Computers, phones, gadgets and accessories', 'cpu', 4),
      ('Furniture', 'furniture', 'Home furniture, decor and appliances', 'sofa', 5),
      ('Jobs', 'jobs', 'Job listings and employment opportunities', 'briefcase', 6),
      ('Other', 'other', 'Everything else', 'tag', 7)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "classified_reports"`);
    await queryRunner.query(`DROP TABLE "classified_messages"`);
    await queryRunner.query(`DROP TABLE "classified_images"`);
    await queryRunner.query(`DROP TABLE "classifieds"`);
    await queryRunner.query(`DROP TABLE "classified_categories"`);
    await queryRunner.query(`DROP TYPE "classified_report_status_enum"`);
    await queryRunner.query(`DROP TYPE "classified_report_reason_enum"`);
    await queryRunner.query(`DROP TYPE "classified_status_enum"`);
    await queryRunner.query(`DROP TYPE "classified_condition_enum"`);
    await queryRunner.query(`DROP TYPE "classified_price_type_enum"`);
  }
}
