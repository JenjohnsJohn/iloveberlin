import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    const existing = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@iloveberlin.biz'],
    );

    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash('Admin123!@#', 12);

      await queryRunner.query(
        `INSERT INTO users (email, password_hash, display_name, role, status, is_verified, email_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        ['admin@iloveberlin.biz', passwordHash, 'Admin', 'super_admin', 'active', true],
      );
      console.log('  Created admin user: admin@iloveberlin.biz (password: Admin123!@#)');
    } else {
      console.log('  Admin user already exists: admin@iloveberlin.biz');
    }
  } finally {
    await queryRunner.release();
  }
}
