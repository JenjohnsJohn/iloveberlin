import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticleSourceFields1710000023000
  implements MigrationInterface
{
  name = 'AddArticleSourceFields1710000023000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN "source_url" varchar(2000)`,
    );

    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN "source_name" varchar(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN IF EXISTS "source_name"`,
    );

    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN IF EXISTS "source_url"`,
    );
  }
}
