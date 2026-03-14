import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductCategoryHierarchy1710000020000
  implements MigrationInterface
{
  name = 'AddProductCategoryHierarchy1710000020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD COLUMN "parent_id" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_product_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_product_categories_parent_id" ON "product_categories" ("parent_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_categories_parent_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT IF EXISTS "FK_product_categories_parent"`,
    );

    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP COLUMN IF EXISTS "parent_id"`,
    );
  }
}
