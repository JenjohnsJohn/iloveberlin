import { DataSource } from 'typeorm';
import { generateSlug } from '../../common/utils/slug.util';

interface SeedTopic {
  name: string;
  icon: string;
  description: string;
  children: { name: string; description: string }[];
}

const GUIDE_TOPIC_TREE: SeedTopic[] = [
  {
    name: 'Getting Started',
    icon: 'rocket',
    description: 'Essential first steps for new arrivals in Berlin',
    children: [
      { name: 'Registration (Anmeldung)', description: 'How to register your address in Berlin' },
      { name: 'Residence Permits', description: 'Visa types and residence permit applications' },
      { name: 'Bank Account', description: 'Opening a German bank account' },
      { name: 'Health Insurance', description: 'Choosing and registering for health insurance' },
      { name: 'First Steps Checklist', description: 'Complete checklist for settling in Berlin' },
    ],
  },
  {
    name: 'Housing',
    icon: 'building',
    description: 'Finding and managing your home in Berlin',
    children: [
      { name: 'Finding Apartments', description: 'Tips and resources for apartment hunting' },
      { name: 'Rental Laws', description: 'German rental law and Mietpreisbremse' },
      { name: 'WG Living', description: 'Shared apartment living (Wohngemeinschaft)' },
      { name: 'Tenant Rights', description: 'Your rights as a tenant in Germany' },
      { name: 'Moving Tips', description: 'Practical tips for moving within Berlin' },
    ],
  },
  {
    name: 'Working',
    icon: 'briefcase',
    description: 'Employment, freelancing, and career guides',
    children: [
      { name: 'Job Search', description: 'Finding work in Berlin' },
      { name: 'Work Permits', description: 'Work visa and employment authorization' },
      { name: 'Freelancing', description: 'Freelance registration and Freiberufler guide' },
      { name: 'Taxes & Filing', description: 'Tax declarations and Steuererklärung' },
      { name: 'Coworking Spaces', description: 'Best coworking spaces in Berlin' },
    ],
  },
  {
    name: 'Transport',
    icon: 'train',
    description: 'Getting around Berlin and beyond',
    children: [
      { name: 'Public Transit (BVG)', description: 'U-Bahn, S-Bahn, buses, and trams' },
      { name: 'Cycling', description: 'Bike infrastructure and cycling tips' },
      { name: 'Car Sharing', description: 'Car sharing services in Berlin' },
      { name: 'Driving License', description: 'Getting or converting a driving license' },
      { name: 'E-Mobility', description: 'Electric scooters, e-bikes, and EVs' },
    ],
  },
  {
    name: 'Healthcare',
    icon: 'heart',
    description: 'Navigating the German healthcare system',
    children: [
      { name: 'Health Insurance Guide', description: 'Public vs. private health insurance' },
      { name: 'Finding Doctors', description: 'How to find English-speaking doctors' },
      { name: 'Emergency Services', description: 'Emergency numbers and hospitals' },
      { name: 'Mental Health', description: 'Mental health resources and therapists' },
      { name: 'Pharmacies', description: 'Using pharmacies (Apotheke) in Germany' },
    ],
  },
  {
    name: 'Education',
    icon: 'book',
    description: 'Schools, universities, and learning in Berlin',
    children: [
      { name: 'Universities', description: 'Berlin universities and application process' },
      { name: 'School System', description: 'School system and enrollment' },
      { name: 'Language Courses', description: 'German language schools and courses' },
      { name: 'Childcare (Kita)', description: 'Finding daycare and Kita registration' },
      { name: 'Libraries', description: 'Public libraries and study spaces' },
    ],
  },
  {
    name: 'Finance & Legal',
    icon: 'wallet',
    description: 'Banking, taxes, insurance, and legal matters',
    children: [
      { name: 'Banking', description: 'Banking services and account management' },
      { name: 'Taxes', description: 'Tax system and filing requirements' },
      { name: 'Insurance', description: 'Liability, household, and other insurance' },
      { name: 'Residency Law', description: 'Aufenthaltstitel and legal residence status' },
      { name: 'Consumer Rights', description: 'Consumer protection and dispute resolution' },
    ],
  },
  {
    name: 'Culture & Language',
    icon: 'globe',
    description: 'Learning German and understanding German culture',
    children: [
      { name: 'Learning German', description: 'Resources and tips for learning German' },
      { name: 'Cultural Norms', description: 'German social norms and etiquette' },
      { name: 'Holidays & Traditions', description: 'German holidays and cultural traditions' },
      { name: 'Social Etiquette', description: 'Navigating German social situations' },
      { name: 'Media', description: 'German media, news, and entertainment' },
    ],
  },
  {
    name: 'Family',
    icon: 'users',
    description: 'Raising children and family life in Berlin',
    children: [
      { name: 'Childcare', description: 'Daycare options and nanny services' },
      { name: 'Schools', description: 'International and public schools' },
      { name: 'Family Benefits (Kindergeld)', description: 'Child benefits and parental leave' },
      { name: 'Playgrounds', description: 'Best playgrounds and kid-friendly spots' },
      { name: 'Parenting', description: 'Parenting resources and groups in Berlin' },
    ],
  },
  {
    name: 'Neighborhoods',
    icon: 'map',
    description: 'Area guides for Berlin neighborhoods',
    children: [
      { name: 'Mitte', description: 'Guide to living in Berlin Mitte' },
      { name: 'Kreuzberg', description: 'Guide to living in Kreuzberg' },
      { name: 'Neukölln', description: 'Guide to living in Neukölln' },
      { name: 'Prenzlauer Berg', description: 'Guide to living in Prenzlauer Berg' },
      { name: 'Friedrichshain', description: 'Guide to living in Friedrichshain' },
      { name: 'Charlottenburg', description: 'Guide to living in Charlottenburg' },
      { name: 'Schöneberg', description: 'Guide to living in Schöneberg' },
      { name: 'Wedding', description: 'Guide to living in Wedding' },
    ],
  },
  {
    name: 'Lifestyle',
    icon: 'palette',
    description: 'Food, nightlife, sports, and lifestyle in Berlin',
    children: [
      { name: 'Food Scene', description: 'Berlin food culture and dining guides' },
      { name: 'Nightlife', description: 'Berlin club and bar scene guide' },
      { name: 'Sports & Fitness', description: 'Sports clubs, gyms, and activities' },
      { name: 'Shopping', description: 'Shopping districts and markets' },
      { name: 'Parks & Nature', description: 'Green spaces and outdoor activities' },
    ],
  },
  {
    name: 'Sustainability',
    icon: 'leaf',
    description: 'Green living and sustainability in Berlin',
    children: [
      { name: 'Green Living', description: 'Eco-friendly lifestyle tips' },
      { name: 'Recycling', description: 'Pfand, recycling system, and waste separation' },
      { name: 'Zero Waste', description: 'Zero waste shops and practices' },
      { name: 'Sustainable Transport', description: 'Eco-friendly ways to get around' },
      { name: 'Urban Gardening', description: 'Community gardens and urban farming' },
    ],
  },
];

export async function seedGuideTopics(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();

    // Build the set of all slugs this seed owns (roots + children)
    const expectedSlugs = new Set<string>();
    for (const root of GUIDE_TOPIC_TREE) {
      expectedSlugs.add(generateSlug(root.name));
      for (const child of root.children) {
        expectedSlugs.add(generateSlug(child.name));
      }
    }

    // Delete any topics not in the seed definition (old/deprecated)
    const allTopics = await queryRunner.query(`SELECT id, name, slug FROM guide_topics`);
    for (const topic of allTopics) {
      if (!expectedSlugs.has(topic.slug)) {
        // Clear parent references first so FK doesn't block delete
        await queryRunner.query(`UPDATE guide_topics SET parent_id = NULL WHERE parent_id = $1`, [topic.id]);
        await queryRunner.query(`UPDATE guides SET topic_id = NULL WHERE topic_id = $1`, [topic.id]);
        await queryRunner.query(`DELETE FROM guide_topics WHERE id = $1`, [topic.id]);
        console.log(`  Removed old topic: ${topic.name} (${topic.slug})`);
      }
    }

    // Upsert roots and children
    for (let i = 0; i < GUIDE_TOPIC_TREE.length; i++) {
      const root = GUIDE_TOPIC_TREE[i];
      const rootSlug = generateSlug(root.name);

      let rootId: string;
      const existingRoot = await queryRunner.query(
        `SELECT id FROM guide_topics WHERE slug = $1`,
        [rootSlug],
      );

      if (existingRoot.length === 0) {
        const inserted = await queryRunner.query(
          `INSERT INTO guide_topics (name, slug, description, icon, sort_order, parent_id)
           VALUES ($1, $2, $3, $4, $5, NULL)
           RETURNING id`,
          [root.name, rootSlug, root.description, root.icon, i],
        );
        rootId = inserted[0].id;
        console.log(`  Created root topic: ${root.name}`);
      } else {
        rootId = existingRoot[0].id;
        await queryRunner.query(
          `UPDATE guide_topics SET name = $1, description = $2, icon = $3, sort_order = $4, parent_id = NULL
           WHERE id = $5`,
          [root.name, root.description, root.icon, i, rootId],
        );
        console.log(`  Updated root topic: ${root.name}`);
      }

      for (let j = 0; j < root.children.length; j++) {
        const child = root.children[j];
        const childSlug = generateSlug(child.name);

        const existingChild = await queryRunner.query(
          `SELECT id FROM guide_topics WHERE slug = $1`,
          [childSlug],
        );

        if (existingChild.length === 0) {
          await queryRunner.query(
            `INSERT INTO guide_topics (name, slug, description, sort_order, parent_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [child.name, childSlug, child.description, j, rootId],
          );
          console.log(`    Created subtopic: ${child.name}`);
        } else {
          await queryRunner.query(
            `UPDATE guide_topics SET name = $1, description = $2, sort_order = $3, parent_id = $4
             WHERE id = $5`,
            [child.name, child.description, j, rootId, existingChild[0].id],
          );
          console.log(`    Updated subtopic: ${child.name}`);
        }
      }
    }

    console.log('Guide topics seed completed.');
  } finally {
    await queryRunner.release();
  }
}
