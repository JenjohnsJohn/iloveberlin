import dataSource from './data-source';
import { seedCategories } from './seeds/categories.seed';
import { seedAdminUser } from './seeds/admin-user.seed';
import { seedClassifiedCategories } from './seeds/classified-categories.seed';
import { seedCuisines } from './seeds/cuisines.seed';
import { seedGuideTopics } from './seeds/guide-topics.seed';
import { seedProductCategories } from './seeds/product-categories.seed';
import { seedEventCategories } from './seeds/event-categories.seed';

async function runSeeds(): Promise<void> {
  console.log('Initializing data source...');
  await dataSource.initialize();

  console.log('Running seeds...');

  console.log('\nSeeding categories...');
  await seedCategories(dataSource);

  console.log('\nSeeding event categories...');
  await seedEventCategories(dataSource);

  console.log('\nSeeding classified categories...');
  await seedClassifiedCategories(dataSource);

  console.log('\nSeeding cuisines...');
  await seedCuisines(dataSource);

  console.log('\nSeeding guide topics...');
  await seedGuideTopics(dataSource);

  console.log('\nSeeding product categories...');
  await seedProductCategories(dataSource);

  console.log('\nSeeding admin user...');
  await seedAdminUser(dataSource);

  console.log('\nAll seeds completed successfully.');
  await dataSource.destroy();
}

runSeeds().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
