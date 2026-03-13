import dataSource from './data-source';
import { seedCategories } from './seeds/categories.seed';
import { seedAdminUser } from './seeds/admin-user.seed';

async function runSeeds(): Promise<void> {
  console.log('Initializing data source...');
  await dataSource.initialize();

  console.log('Running seeds...');

  console.log('\nSeeding categories...');
  await seedCategories(dataSource);

  console.log('\nSeeding admin user...');
  await seedAdminUser(dataSource);

  console.log('\nAll seeds completed successfully.');
  await dataSource.destroy();
}

runSeeds().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
