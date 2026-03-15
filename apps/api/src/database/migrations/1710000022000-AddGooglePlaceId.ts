import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGooglePlaceId1710000022000
  implements MigrationInterface
{
  name = 'AddGooglePlaceId1710000022000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "restaurants" ADD COLUMN "google_place_id" varchar(255)`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_restaurants_google_place_id" ON "restaurants" ("google_place_id") WHERE "google_place_id" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_restaurants_google_place_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "google_place_id"`,
    );
  }
}
