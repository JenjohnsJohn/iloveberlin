import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTables1710000012000 implements MigrationInterface {
  name = 'CreateAnalyticsTables1710000012000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create page_views table
    await queryRunner.query(`
      CREATE TABLE "page_views" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "path" character varying(500) NOT NULL,
        "user_id" uuid,
        "session_id" character varying(255),
        "referrer" character varying(500),
        "user_agent" character varying(500),
        "ip_address" character varying(45),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_page_views" PRIMARY KEY ("id"),
        CONSTRAINT "FK_page_views_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create analytics_daily table
    await queryRunner.query(`
      CREATE TABLE "analytics_daily" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "date" date NOT NULL,
        "page_views" integer NOT NULL DEFAULT 0,
        "unique_visitors" integer NOT NULL DEFAULT 0,
        "new_users" integer NOT NULL DEFAULT 0,
        "articles_published" integer NOT NULL DEFAULT 0,
        "events_created" integer NOT NULL DEFAULT 0,
        "search_queries" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analytics_daily" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_analytics_daily_date" UNIQUE ("date")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_page_views_path" ON "page_views" ("path")`);
    await queryRunner.query(`CREATE INDEX "IDX_page_views_user_id" ON "page_views" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_page_views_session_id" ON "page_views" ("session_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_page_views_created_at" ON "page_views" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_analytics_daily_date" ON "analytics_daily" ("date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analytics_daily"`);
    await queryRunner.query(`DROP TABLE "page_views"`);
  }
}
