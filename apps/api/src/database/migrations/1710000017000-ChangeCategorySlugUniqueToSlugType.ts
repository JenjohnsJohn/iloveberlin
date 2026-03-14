import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCategorySlugUniqueToSlugType1710000017000
  implements MigrationInterface
{
  name = 'ChangeCategorySlugUniqueToSlugType1710000017000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old unique constraint on slug alone
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_categories_slug"`,
    );

    // Add new unique constraint on (slug, type) pair
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_categories_slug_type" UNIQUE ("slug", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_categories_slug_type"`,
    );

    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")`,
    );
  }
}
