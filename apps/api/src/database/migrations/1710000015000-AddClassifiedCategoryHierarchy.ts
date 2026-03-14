import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassifiedCategoryHierarchy1710000015000
  implements MigrationInterface
{
  name = 'AddClassifiedCategoryHierarchy1710000015000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "classified_categories" ADD COLUMN "parent_id" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "classified_categories" ADD CONSTRAINT "FK_classified_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "classified_categories"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_classified_categories_parent_id" ON "classified_categories" ("parent_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_classified_categories_parent_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "classified_categories" DROP CONSTRAINT IF EXISTS "FK_classified_categories_parent"`,
    );

    await queryRunner.query(
      `ALTER TABLE "classified_categories" DROP COLUMN IF EXISTS "parent_id"`,
    );
  }
}
