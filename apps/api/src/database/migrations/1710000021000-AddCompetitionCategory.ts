import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompetitionCategory1710000021000
  implements MigrationInterface
{
  name = 'AddCompetitionCategory1710000021000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "competitions" ADD COLUMN "category_id" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "competitions" ADD CONSTRAINT "FK_competitions_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_competitions_category_id" ON "competitions" ("category_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_competitions_category_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "competitions" DROP CONSTRAINT IF EXISTS "FK_competitions_category"`,
    );

    await queryRunner.query(
      `ALTER TABLE "competitions" DROP COLUMN IF EXISTS "category_id"`,
    );
  }
}
