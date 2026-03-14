import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuideTopicHierarchy1710000019000 implements MigrationInterface {
  name = 'AddGuideTopicHierarchy1710000019000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "guide_topics" ADD COLUMN "parent_id" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "guide_topics" ADD CONSTRAINT "FK_guide_topics_parent" FOREIGN KEY ("parent_id") REFERENCES "guide_topics"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_guide_topics_parent_id" ON "guide_topics" ("parent_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_guide_topics_parent_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "guide_topics" DROP CONSTRAINT IF EXISTS "FK_guide_topics_parent"`,
    );

    await queryRunner.query(
      `ALTER TABLE "guide_topics" DROP COLUMN IF EXISTS "parent_id"`,
    );
  }
}
