import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompetitionsTables1710000007000 implements MigrationInterface {
  name = 'CreateCompetitionsTables1710000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create competition status enum
    await queryRunner.query(`
      CREATE TYPE "competition_status_enum" AS ENUM ('draft', 'active', 'closed', 'archived')
    `);

    // Create competitions table
    await queryRunner.query(`
      CREATE TABLE "competitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(255) NOT NULL,
        "slug" character varying(300) NOT NULL,
        "description" text NOT NULL,
        "prize_description" text,
        "featured_image_id" uuid,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" "competition_status_enum" NOT NULL DEFAULT 'draft',
        "terms_conditions" text,
        "max_entries" integer,
        "winner_id" uuid,
        "winner_selected_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_competitions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_competitions_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_competitions_featured_image" FOREIGN KEY ("featured_image_id") REFERENCES "media"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_competitions_winner" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create competition_entries table
    await queryRunner.query(`
      CREATE TABLE "competition_entries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "competition_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "entry_data" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_competition_entries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_competition_entries_user_competition" UNIQUE ("competition_id", "user_id"),
        CONSTRAINT "FK_competition_entries_competition" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_competition_entries_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes on competitions
    await queryRunner.query(`CREATE INDEX "IDX_competitions_slug" ON "competitions" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_competitions_status" ON "competitions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_competitions_start_date" ON "competitions" ("start_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_competitions_end_date" ON "competitions" ("end_date")`);

    // Create indexes on competition_entries
    await queryRunner.query(`CREATE INDEX "IDX_competition_entries_competition_id" ON "competition_entries" ("competition_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_competition_entries_user_id" ON "competition_entries" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "competition_entries"`);
    await queryRunner.query(`DROP TABLE "competitions"`);
    await queryRunner.query(`DROP TYPE "competition_status_enum"`);
  }
}
