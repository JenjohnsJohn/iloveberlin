import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface SeedCuisine {
  name: string;
  children: string[];
}

const CUISINE_TREE: SeedCuisine[] = [
  {
    name: 'European',
    children: ['German', 'Italian', 'French', 'Greek', 'Spanish', 'Polish', 'Austrian', 'British', 'Nordic'],
  },
  {
    name: 'Asian',
    children: ['Japanese', 'Chinese', 'Korean', 'Thai', 'Vietnamese', 'Indian', 'Indonesian', 'Malaysian'],
  },
  {
    name: 'Middle Eastern',
    children: ['Turkish', 'Lebanese', 'Israeli', 'Persian', 'Syrian', 'Afghan'],
  },
  {
    name: 'African',
    children: ['Ethiopian', 'Moroccan', 'West African', 'East African'],
  },
  {
    name: 'Americas',
    children: ['American', 'Mexican', 'Brazilian', 'Caribbean', 'Peruvian'],
  },
  {
    name: 'Vegan & Dietary',
    children: ['Vegan', 'Vegetarian', 'Organic', 'Halal', 'Kosher', 'Gluten-Free'],
  },
  {
    name: 'Dining Style',
    children: ['Fine Dining', 'Casual Dining', 'Street Food', 'Brunch & Breakfast', 'Café & Bakery', 'Fast Casual'],
  },
  {
    name: 'By Dish',
    children: ['Pizza', 'Burger', 'Sushi', 'Ramen', 'Döner', 'Currywurst', 'Tacos', 'Falafel'],
  },
];

// Old flat cuisines that are now subcuisines or removed
const DEPRECATED_SLUGS = [
  'georgian',
  'mediterranean',
  'bakery-cafe',
];

export async function seedCuisines(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    // Deactivate deprecated standalone cuisines
    for (const slug of DEPRECATED_SLUGS) {
      const existing = await queryRunner.query(
        `SELECT id FROM cuisines WHERE slug = $1`,
        [slug],
      );
      if (existing.length > 0) {
        await queryRunner.query(
          `DELETE FROM cuisines WHERE slug = $1`,
          [slug],
        );
        console.log(`  Removed deprecated cuisine: ${slug}`);
      }
    }

    // Upsert root cuisines and children
    for (let i = 0; i < CUISINE_TREE.length; i++) {
      const root = CUISINE_TREE[i];
      const rootSlug = generateSlug(root.name);

      let rootId: string;
      const existingRoot = await queryRunner.query(
        `SELECT id FROM cuisines WHERE slug = $1`,
        [rootSlug],
      );

      if (existingRoot.length === 0) {
        const inserted = await queryRunner.query(
          `INSERT INTO cuisines (name, slug, sort_order, parent_id)
           VALUES ($1, $2, $3, NULL)
           RETURNING id`,
          [root.name, rootSlug, i],
        );
        rootId = inserted[0].id;
        console.log(`  Created root cuisine: ${root.name}`);
      } else {
        rootId = existingRoot[0].id;
        await queryRunner.query(
          `UPDATE cuisines SET name = $1, sort_order = $2, parent_id = NULL
           WHERE id = $3`,
          [root.name, i, rootId],
        );
        console.log(`  Updated root cuisine: ${root.name}`);
      }

      for (let j = 0; j < root.children.length; j++) {
        const childName = root.children[j];
        const childSlug = generateSlug(childName);

        const existingChild = await queryRunner.query(
          `SELECT id FROM cuisines WHERE slug = $1`,
          [childSlug],
        );

        if (existingChild.length === 0) {
          await queryRunner.query(
            `INSERT INTO cuisines (name, slug, sort_order, parent_id)
             VALUES ($1, $2, $3, $4)`,
            [childName, childSlug, j, rootId],
          );
          console.log(`    Created subcuisine: ${childName}`);
        } else {
          await queryRunner.query(
            `UPDATE cuisines SET name = $1, sort_order = $2, parent_id = $3
             WHERE id = $4`,
            [childName, j, rootId, existingChild[0].id],
          );
          console.log(`    Updated subcuisine: ${childName}`);
        }
      }
    }

    console.log('Cuisines seed completed.');
  } finally {
    await queryRunner.release();
  }
}
