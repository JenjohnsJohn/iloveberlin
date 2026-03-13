import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTables1710000004000 implements MigrationInterface {
  name = 'CreateEventsTables1710000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create venues table
    await queryRunner.query(`
      CREATE TABLE "venues" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "address" character varying(500) NOT NULL,
        "district" character varying(100),
        "latitude" decimal(10,7),
        "longitude" decimal(10,7),
        "website" character varying(500),
        "phone" character varying(50),
        "capacity" integer,
        "description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venues" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_venues_slug" UNIQUE ("slug")
      )
    `);

    // Create event status enum
    await queryRunner.query(`
      CREATE TYPE "event_status_enum" AS ENUM ('draft', 'pending', 'approved', 'published', 'archived')
    `);

    // Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "slug" character varying(300) NOT NULL,
        "description" text NOT NULL,
        "excerpt" text,
        "venue_id" uuid,
        "category_id" uuid,
        "start_date" date NOT NULL,
        "end_date" date,
        "start_time" time,
        "end_time" time,
        "is_recurring" boolean NOT NULL DEFAULT false,
        "rrule" character varying(500),
        "is_free" boolean NOT NULL DEFAULT true,
        "price" decimal(10,2),
        "price_max" decimal(10,2),
        "ticket_url" character varying(500),
        "featured_image_id" uuid,
        "status" "event_status_enum" NOT NULL DEFAULT 'draft',
        "submitted_by" uuid,
        "approved_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_events" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_events_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_events_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_featured_image" FOREIGN KEY ("featured_image_id") REFERENCES "media"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_submitted_by" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_events_approved_by" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes on venues
    await queryRunner.query(`CREATE INDEX "IDX_venues_slug" ON "venues" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_venues_district" ON "venues" ("district")`);

    // Create indexes on events
    await queryRunner.query(`CREATE INDEX "IDX_events_slug" ON "events" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_status" ON "events" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_start_date" ON "events" ("start_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_end_date" ON "events" ("end_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_venue_id" ON "events" ("venue_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_category_id" ON "events" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_is_free" ON "events" ("is_free")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_submitted_by" ON "events" ("submitted_by")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "event_status_enum"`);
    await queryRunner.query(`DROP TABLE "venues"`);
  }
}
