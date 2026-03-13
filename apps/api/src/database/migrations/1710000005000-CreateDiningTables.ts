import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDiningTables1710000005000 implements MigrationInterface {
  name = 'CreateDiningTables1710000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create cuisines table
    await queryRunner.query(`
      CREATE TABLE "cuisines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cuisines" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cuisines_slug" UNIQUE ("slug")
      )
    `);

    // Create price range enum
    await queryRunner.query(`
      CREATE TYPE "price_range_enum" AS ENUM ('budget', 'moderate', 'upscale', 'fine_dining')
    `);

    // Create restaurant status enum
    await queryRunner.query(`
      CREATE TYPE "restaurant_status_enum" AS ENUM ('draft', 'published', 'archived')
    `);

    // Create restaurants table
    await queryRunner.query(`
      CREATE TABLE "restaurants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "description" text NOT NULL,
        "address" character varying(500) NOT NULL,
        "district" character varying(100),
        "latitude" decimal(10,7),
        "longitude" decimal(10,7),
        "phone" character varying(50),
        "website" character varying(500),
        "email" character varying(255),
        "price_range" "price_range_enum" NOT NULL DEFAULT 'moderate',
        "rating" decimal(2,1),
        "opening_hours" jsonb NOT NULL DEFAULT '{}',
        "featured_image_id" uuid,
        "status" "restaurant_status_enum" NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_restaurants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_restaurants_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_restaurants_featured_image" FOREIGN KEY ("featured_image_id") REFERENCES "media"("id") ON DELETE SET NULL
      )
    `);

    // Create restaurant_cuisines junction table
    await queryRunner.query(`
      CREATE TABLE "restaurant_cuisines" (
        "restaurant_id" uuid NOT NULL,
        "cuisine_id" uuid NOT NULL,
        CONSTRAINT "PK_restaurant_cuisines" PRIMARY KEY ("restaurant_id", "cuisine_id"),
        CONSTRAINT "FK_restaurant_cuisines_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_restaurant_cuisines_cuisine" FOREIGN KEY ("cuisine_id") REFERENCES "cuisines"("id") ON DELETE CASCADE
      )
    `);

    // Create restaurant_images table
    await queryRunner.query(`
      CREATE TABLE "restaurant_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "media_id" uuid NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "caption" character varying(255),
        CONSTRAINT "PK_restaurant_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_restaurant_images_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_restaurant_images_media" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE
      )
    `);

    // Create dining_offers table
    await queryRunner.query(`
      CREATE TABLE "dining_offers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "restaurant_id" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dining_offers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dining_offers_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_cuisines_slug" ON "cuisines" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_cuisines_sort_order" ON "cuisines" ("sort_order")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurants_slug" ON "restaurants" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurants_status" ON "restaurants" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurants_district" ON "restaurants" ("district")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurants_price_range" ON "restaurants" ("price_range")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurants_rating" ON "restaurants" ("rating")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurant_cuisines_cuisine" ON "restaurant_cuisines" ("cuisine_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurant_images_restaurant" ON "restaurant_images" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_dining_offers_restaurant" ON "dining_offers" ("restaurant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_dining_offers_dates" ON "dining_offers" ("start_date", "end_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_dining_offers_active" ON "dining_offers" ("is_active")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dining_offers"`);
    await queryRunner.query(`DROP TABLE "restaurant_images"`);
    await queryRunner.query(`DROP TABLE "restaurant_cuisines"`);
    await queryRunner.query(`DROP TABLE "restaurants"`);
    await queryRunner.query(`DROP TYPE "restaurant_status_enum"`);
    await queryRunner.query(`DROP TYPE "price_range_enum"`);
    await queryRunner.query(`DROP TABLE "cuisines"`);
  }
}
