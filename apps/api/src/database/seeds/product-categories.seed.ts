import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface SeedCategory {
  name: string;
  description: string;
  children: { name: string; description: string }[];
}

const PRODUCT_CATEGORY_TREE: SeedCategory[] = [
  {
    name: 'Apparel',
    description: 'T-shirts, hoodies, and Berlin-themed clothing',
    children: [
      { name: 'T-Shirts', description: 'Berlin-themed t-shirts and graphic tees' },
      { name: 'Hoodies & Sweatshirts', description: 'Hoodies and sweatshirts with Berlin designs' },
      { name: 'Jackets', description: 'Jackets and outerwear' },
      { name: 'Hats & Caps', description: 'Hats, caps, and beanies' },
      { name: 'Socks', description: 'Fun and themed socks' },
    ],
  },
  {
    name: 'Accessories',
    description: 'Bags, hats, pins, and wearable accessories',
    children: [
      { name: 'Bags & Totes', description: 'Tote bags, backpacks, and carriers' },
      { name: 'Jewelry', description: 'Berlin-inspired jewelry and accessories' },
      { name: 'Watches', description: 'Berlin-themed watches' },
      { name: 'Scarves', description: 'Scarves and wraps' },
      { name: 'Pins & Patches', description: 'Enamel pins and embroidered patches' },
    ],
  },
  {
    name: 'Art & Prints',
    description: 'Posters, prints, and artwork featuring Berlin',
    children: [
      { name: 'Posters', description: 'Berlin cityscape and art posters' },
      { name: 'Photography Prints', description: 'Fine art photography prints' },
      { name: 'Canvas Art', description: 'Canvas prints and wall art' },
      { name: 'Postcards', description: 'Berlin postcards and greeting cards' },
      { name: 'Stickers', description: 'Vinyl stickers and decals' },
    ],
  },
  {
    name: 'Home & Living',
    description: 'Mugs, pillows, and home decor items',
    children: [
      { name: 'Mugs & Drinkware', description: 'Coffee mugs and drinking glasses' },
      { name: 'Cushions & Pillows', description: 'Decorative cushions and throw pillows' },
      { name: 'Blankets', description: 'Throws and blankets' },
      { name: 'Candles', description: 'Berlin-scented and themed candles' },
      { name: 'Kitchen Items', description: 'Kitchen accessories and utensils' },
    ],
  },
  {
    name: 'Food & Drink',
    description: 'Local Berlin food products and beverages',
    children: [
      { name: 'Craft Beer', description: 'Berlin craft beers and brewing kits' },
      { name: 'Coffee & Tea', description: 'Berlin-roasted coffee and specialty teas' },
      { name: 'Chocolate', description: 'Artisanal chocolates and confections' },
      { name: 'Snacks', description: 'Berlin-style snacks and treats' },
      { name: 'Condiments', description: 'Sauces, spreads, and condiments' },
    ],
  },
  {
    name: 'Books & Media',
    description: 'Books, magazines, and media about Berlin',
    children: [
      { name: 'Travel Books', description: 'Berlin travel guides and photo books' },
      { name: 'History Books', description: 'Books about Berlin history' },
      { name: 'Novels', description: 'Fiction set in Berlin' },
      { name: 'Maps & Guides', description: 'City maps and pocket guides' },
      { name: 'Vinyl Records', description: 'Berlin music on vinyl' },
    ],
  },
  {
    name: 'Berlin Souvenirs',
    description: 'Classic Berlin souvenirs and memorabilia',
    children: [
      { name: 'Magnets', description: 'Fridge magnets and refrigerator art' },
      { name: 'Keychains', description: 'Berlin-themed keychains' },
      { name: 'Snow Globes', description: 'Collectible Berlin snow globes' },
      { name: 'Miniatures', description: 'Miniature Berlin landmarks' },
      { name: 'Gift Sets', description: 'Curated Berlin gift sets' },
    ],
  },
  {
    name: 'Stationery',
    description: 'Notebooks, postcards, and stationery items',
    children: [
      { name: 'Notebooks', description: 'Berlin-themed journals and notebooks' },
      { name: 'Pens & Pencils', description: 'Writing instruments and sets' },
      { name: 'Calendars', description: 'Berlin photo calendars and planners' },
      { name: 'Greeting Cards', description: 'Berlin-themed greeting cards' },
      { name: 'Wrapping Paper', description: 'Gift wrapping paper and supplies' },
    ],
  },
  {
    name: 'Kids & Baby',
    description: 'Products for children and babies',
    children: [
      { name: 'Kids Clothing', description: 'Children clothing with Berlin themes' },
      { name: 'Toys', description: 'Berlin-themed toys and games' },
      { name: "Children's Books", description: 'Kids books about Berlin' },
      { name: 'Baby Accessories', description: 'Baby bibs, onesies, and accessories' },
      { name: 'Baby Gear', description: 'Practical baby gear and items' },
    ],
  },
  {
    name: 'Digital Products',
    description: 'Digital downloads, guides, and templates',
    children: [
      { name: 'E-Books', description: 'Digital Berlin guides and e-books' },
      { name: 'Digital Art', description: 'Downloadable Berlin artwork' },
      { name: 'Gift Cards', description: 'Digital gift cards and vouchers' },
      { name: 'Online Courses', description: 'Berlin-related online courses' },
      { name: 'Music Downloads', description: 'Berlin music digital downloads' },
    ],
  },
];

export async function seedProductCategories(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    for (let i = 0; i < PRODUCT_CATEGORY_TREE.length; i++) {
      const root = PRODUCT_CATEGORY_TREE[i];
      const rootSlug = generateSlug(root.name);

      let rootId: string;
      const existingRoot = await queryRunner.query(
        `SELECT id FROM product_categories WHERE slug = $1`,
        [rootSlug],
      );

      if (existingRoot.length === 0) {
        const inserted = await queryRunner.query(
          `INSERT INTO product_categories (name, slug, description, sort_order, is_active, parent_id)
           VALUES ($1, $2, $3, $4, true, NULL)
           RETURNING id`,
          [root.name, rootSlug, root.description, i],
        );
        rootId = inserted[0].id;
        console.log(`  Created root product category: ${root.name}`);
      } else {
        rootId = existingRoot[0].id;
        await queryRunner.query(
          `UPDATE product_categories SET name = $1, description = $2, sort_order = $3, is_active = true, parent_id = NULL
           WHERE id = $4`,
          [root.name, root.description, i, rootId],
        );
        console.log(`  Updated root product category: ${root.name}`);
      }

      for (let j = 0; j < root.children.length; j++) {
        const child = root.children[j];
        const childSlug = generateSlug(child.name);

        const existingChild = await queryRunner.query(
          `SELECT id FROM product_categories WHERE slug = $1`,
          [childSlug],
        );

        if (existingChild.length === 0) {
          await queryRunner.query(
            `INSERT INTO product_categories (name, slug, description, sort_order, is_active, parent_id)
             VALUES ($1, $2, $3, $4, true, $5)`,
            [child.name, childSlug, child.description, j, rootId],
          );
          console.log(`    Created subcategory: ${child.name}`);
        } else {
          await queryRunner.query(
            `UPDATE product_categories SET name = $1, description = $2, sort_order = $3, is_active = true, parent_id = $4
             WHERE id = $5`,
            [child.name, child.description, j, rootId, existingChild[0].id],
          );
          console.log(`    Updated subcategory: ${child.name}`);
        }
      }
    }

    console.log('Product categories seed completed.');
  } finally {
    await queryRunner.release();
  }
}
