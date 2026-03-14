import dataSource from './data-source';
import { seedVenues } from './seeds/content/venues.seed';
import { seedArticles } from './seeds/content/articles.seed';
import { seedEvents } from './seeds/content/events.seed';
import { seedRestaurants } from './seeds/content/restaurants.seed';
import { seedGuides } from './seeds/content/guides.seed';
import { seedVideos } from './seeds/content/videos.seed';
import { seedCompetitions } from './seeds/content/competitions.seed';
import { seedClassifieds } from './seeds/content/classifieds.seed';
import { seedProducts } from './seeds/content/products.seed';

async function runContentSeeds(): Promise<void> {
  console.log('Initializing data source...');
  await dataSource.initialize();

  console.log('Running content seeds...\n');

  console.log('Seeding venues...');
  await seedVenues(dataSource);

  console.log('Seeding articles...');
  await seedArticles(dataSource);

  console.log('Seeding events...');
  await seedEvents(dataSource);

  console.log('Seeding restaurants...');
  await seedRestaurants(dataSource);

  console.log('Seeding guides...');
  await seedGuides(dataSource);

  console.log('Seeding videos...');
  await seedVideos(dataSource);

  console.log('Seeding competitions...');
  await seedCompetitions(dataSource);

  console.log('Seeding classifieds...');
  await seedClassifieds(dataSource);

  console.log('Seeding products...');
  await seedProducts(dataSource);

  console.log('\nAll content seeds completed successfully.');
  await dataSource.destroy();
}

runContentSeeds().catch((error) => {
  console.error('Content seed failed:', error);
  process.exit(1);
});
