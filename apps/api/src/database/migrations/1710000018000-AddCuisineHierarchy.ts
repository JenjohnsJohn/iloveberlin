import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCuisineHierarchy1710000018000 implements MigrationInterface {
  name = 'AddCuisineHierarchy1710000018000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cuisines" ADD COLUMN "parent_id" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "cuisines" ADD CONSTRAINT "FK_cuisines_parent" FOREIGN KEY ("parent_id") REFERENCES "cuisines"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_cuisines_parent_id" ON "cuisines" ("parent_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_cuisines_parent_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "cuisines" DROP CONSTRAINT IF EXISTS "FK_cuisines_parent"`,
    );

    await queryRunner.query(
      `ALTER TABLE "cuisines" DROP COLUMN IF EXISTS "parent_id"`,
    );
  }
}
