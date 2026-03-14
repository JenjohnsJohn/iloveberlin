import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuideInReviewStatus1710000016000 implements MigrationInterface {
  name = 'AddGuideInReviewStatus1710000016000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "guide_status_enum" ADD VALUE IF NOT EXISTS 'in_review'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres does not support removing enum values directly.
    // To revert, you would need to recreate the type without 'in_review'.
    // This is intentionally left as a no-op for safety.
  }
}
