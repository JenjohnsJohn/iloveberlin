import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTables1710000011000 implements MigrationInterface {
  name = 'CreateNotificationsTables1710000011000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification_preferences table
    await queryRunner.query(`
      CREATE TABLE "notification_preferences" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "email_new_articles" boolean NOT NULL DEFAULT true,
        "email_events" boolean NOT NULL DEFAULT true,
        "email_competitions" boolean NOT NULL DEFAULT true,
        "email_newsletter" boolean NOT NULL DEFAULT true,
        "push_new_articles" boolean NOT NULL DEFAULT true,
        "push_events" boolean NOT NULL DEFAULT true,
        "push_competitions" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_preferences_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_notification_preferences_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create newsletter_subscribers table
    await queryRunner.query(`
      CREATE TABLE "newsletter_subscribers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255) NOT NULL,
        "is_confirmed" boolean NOT NULL DEFAULT false,
        "confirmation_token" character varying(255),
        "subscribed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "unsubscribed_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_newsletter_subscribers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_newsletter_subscribers_email" UNIQUE ("email")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_notification_preferences_user_id" ON "notification_preferences" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_newsletter_subscribers_email" ON "newsletter_subscribers" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_newsletter_subscribers_confirmation_token" ON "newsletter_subscribers" ("confirmation_token")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "newsletter_subscribers"`);
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
  }
}
