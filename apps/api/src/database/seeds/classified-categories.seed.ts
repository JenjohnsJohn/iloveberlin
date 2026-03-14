import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface SubcategoryDef {
  name: string;
  children?: string[];
}

const CLASSIFIED_SUBCATEGORIES: Record<string, SubcategoryDef[]> = {
  vehicles: [
    {
      name: 'Cars',
      children: ['Used Cars', 'New Cars', 'Electric Cars', 'Classic Cars', 'Car Rentals'],
    },
    {
      name: 'Motorcycles',
      children: ['Used Motorcycles', 'New Motorcycles', 'Scooters'],
    },
    {
      name: 'Bicycles',
      children: ['City Bikes', 'Mountain Bikes', 'Electric Bikes', 'Bike Accessories'],
    },
    {
      name: 'Commercial Vehicles',
      children: ['Vans', 'Trucks', 'Trailers'],
    },
    {
      name: 'Vehicle Parts',
      children: ['Car Parts', 'Motorcycle Parts', 'Tires & Wheels', 'Accessories'],
    },
  ],
  services: [
    {
      name: 'Home Services',
      children: ['Cleaning', 'Plumbing', 'Electrical', 'Handyman'],
    },
    {
      name: 'Personal Services',
      children: ['Beauty & Wellness', 'Fitness Training', 'Pet Care', 'Childcare'],
    },
    {
      name: 'Professional Services',
      children: ['Legal Services', 'Tax & Accounting', 'Translation', 'IT Support'],
    },
    {
      name: 'Education & Tutoring',
      children: ['Language Lessons', 'Music Lessons', 'Academic Tutoring'],
    },
    {
      name: 'Repair Services',
      children: ['Phone Repair', 'Computer Repair', 'Appliance Repair'],
    },
  ],
  property: [
    {
      name: 'Apartments',
      children: ['Apartments for Rent', 'Apartments for Sale'],
    },
    {
      name: 'Rooms',
      children: ['WG Rooms', 'Single Rooms'],
    },
    {
      name: 'Houses',
      children: ['Houses for Rent', 'Houses for Sale'],
    },
    {
      name: 'Commercial Spaces',
      children: ['Offices', 'Retail Spaces', 'Warehouses'],
    },
    {
      name: 'Temporary Housing',
      children: ['Short Term Rentals', 'Sublets'],
    },
  ],
  electronics: [
    {
      name: 'Phones',
      children: ['Smartphones', 'Phone Accessories'],
    },
    {
      name: 'Computers',
      children: ['Laptops', 'Desktops', 'Computer Accessories'],
    },
    {
      name: 'Tablets',
    },
    {
      name: 'TVs & Audio',
      children: ['Televisions', 'Speakers', 'Headphones'],
    },
    {
      name: 'Cameras',
      children: ['Digital Cameras', 'Camera Lenses', 'Camera Accessories'],
    },
    {
      name: 'Gaming',
      children: ['Consoles', 'Video Games', 'Gaming Accessories'],
    },
    {
      name: 'Accessories',
      children: ['Cables & Adapters', 'Storage Devices', 'Chargers'],
    },
  ],
  furniture: [
    {
      name: 'Living Room',
      children: ['Sofas & Couches', 'Coffee Tables', 'Shelving & Storage'],
    },
    {
      name: 'Bedroom',
      children: ['Beds & Mattresses', 'Wardrobes', 'Dressers'],
    },
    {
      name: 'Dining Room',
      children: ['Dining Tables', 'Dining Chairs'],
    },
    {
      name: 'Office Furniture',
      children: ['Desks', 'Office Chairs', 'Bookcases'],
    },
    {
      name: 'Outdoor Furniture',
      children: ['Garden Furniture', 'Balcony Furniture'],
    },
  ],
  jobs: [
    { name: 'Full Time Jobs' },
    { name: 'Part Time Jobs' },
    { name: 'Freelance Jobs' },
    { name: 'Internships' },
    { name: 'Temporary Jobs' },
    { name: 'Remote Jobs' },
    {
      name: 'Hospitality Jobs',
      children: ['Restaurant Jobs', 'Hotel Jobs', 'Bar Jobs'],
    },
    {
      name: 'IT & Tech Jobs',
      children: ['Software Development', 'Data & Analytics', 'IT Support'],
    },
  ],
  other: [
    {
      name: 'Tickets',
      children: ['Concert Tickets', 'Event Tickets', 'Travel Tickets'],
    },
    {
      name: 'Free Items',
      children: ['Free Furniture', 'Free Electronics'],
    },
    {
      name: 'Community Listings',
      children: ['Lost & Found', 'Wanted'],
    },
    {
      name: 'Miscellaneous',
      children: ['Collectibles', 'Books & Media', 'Sports Equipment'],
    },
  ],
};

export async function seedClassifiedCategories(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    for (const [rootSlug, subcategories] of Object.entries(CLASSIFIED_SUBCATEGORIES)) {
      // Look up the root category
      const parentRows = await queryRunner.query(
        `SELECT id, name FROM classified_categories WHERE slug = $1`,
        [rootSlug],
      );

      if (parentRows.length === 0) {
        console.log(`  Warning: root classified category not found for slug: ${rootSlug}`);
        continue;
      }

      const rootId = parentRows[0].id;
      const rootName = parentRows[0].name;

      // Seed level-2 subcategories
      for (let i = 0; i < subcategories.length; i++) {
        const subcat = subcategories[i];
        const l2Slug = generateSlug(subcat.name);

        const existingL2 = await queryRunner.query(
          `SELECT id FROM classified_categories WHERE slug = $1`,
          [l2Slug],
        );

        let l2Id: string;

        if (existingL2.length === 0) {
          const insertedL2 = await queryRunner.query(
            `INSERT INTO classified_categories (name, slug, parent_id, sort_order, is_active)
             VALUES ($1, $2, $3, $4, true) RETURNING id`,
            [subcat.name, l2Slug, rootId, i],
          );
          l2Id = insertedL2[0].id;
          console.log(`  Created subcategory: ${rootName} > ${subcat.name}`);
        } else {
          l2Id = existingL2[0].id;
          console.log(`  Subcategory already exists: ${rootName} > ${subcat.name}`);
        }

        // Seed level-3 sub-subcategories
        if (subcat.children) {
          for (let j = 0; j < subcat.children.length; j++) {
            const childName = subcat.children[j];
            const l3Slug = `${l2Slug}-${generateSlug(childName)}`;

            const existingL3 = await queryRunner.query(
              `SELECT id FROM classified_categories WHERE slug = $1`,
              [l3Slug],
            );

            if (existingL3.length === 0) {
              await queryRunner.query(
                `INSERT INTO classified_categories (name, slug, parent_id, sort_order, is_active)
                 VALUES ($1, $2, $3, $4, true)`,
                [childName, l3Slug, l2Id, j],
              );
              console.log(`  Created sub-subcategory: ${rootName} > ${subcat.name} > ${childName}`);
            } else {
              console.log(`  Sub-subcategory already exists: ${rootName} > ${subcat.name} > ${childName}`);
            }
          }
        }
      }
    }

    console.log('Classified categories seed completed.');
  } finally {
    await queryRunner.release();
  }
}
