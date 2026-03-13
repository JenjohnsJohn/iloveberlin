import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryDynamicFields1710000014000
  implements MigrationInterface
{
  name = 'AddCategoryDynamicFields1710000014000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add field_schema column to classified_categories
    await queryRunner.query(
      `ALTER TABLE "classified_categories" ADD COLUMN "field_schema" jsonb NOT NULL DEFAULT '[]'`,
    );

    // Add category_fields column to classifieds
    await queryRunner.query(
      `ALTER TABLE "classifieds" ADD COLUMN "category_fields" jsonb NOT NULL DEFAULT '{}'`,
    );

    // GIN index for efficient JSONB queries
    await queryRunner.query(
      `CREATE INDEX "IDX_classifieds_category_fields" ON "classifieds" USING GIN ("category_fields")`,
    );

    // ─── Seed field schemas for each category ──────────────

    // Vehicles
    await queryRunner.query(`
      UPDATE "classified_categories" SET "field_schema" = $1 WHERE "slug" = 'vehicles'
    `, [JSON.stringify([
      { key: 'vehicle_type', label: 'Vehicle Type', type: 'select', required: true, options: ['Car', 'Motorcycle', 'Bicycle', 'Scooter', 'Van', 'Truck', 'Other'], group: 'basic', sort_order: 1, filterable: true, show_in_listing: true },
      { key: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., BMW, Mercedes, VW', group: 'basic', sort_order: 2, filterable: true, show_in_listing: true, validation: { max: 100 } },
      { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., 3 Series, Golf', group: 'basic', sort_order: 3, filterable: true, show_in_listing: true, validation: { max: 100 } },
      { key: 'year', label: 'Year', type: 'number', required: true, placeholder: 'e.g., 2020', group: 'basic', sort_order: 4, filterable: true, show_in_listing: true, validation: { min: 1900, max: 2030 } },
      { key: 'mileage', label: 'Mileage (km)', type: 'number', required: false, placeholder: 'e.g., 50000', group: 'details', sort_order: 5, filterable: true, validation: { min: 0 } },
      { key: 'fuel_type', label: 'Fuel Type', type: 'select', required: false, options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'Other'], group: 'details', sort_order: 6, filterable: true },
      { key: 'transmission', label: 'Transmission', type: 'select', required: false, options: ['Automatic', 'Manual', 'Semi-Automatic'], group: 'details', sort_order: 7, filterable: true },
      { key: 'vehicle_condition', label: 'Vehicle Condition', type: 'select', required: false, options: ['Excellent', 'Good', 'Fair', 'Needs Work', 'For Parts'], group: 'details', sort_order: 8 },
      { key: 'color', label: 'Color', type: 'text', required: false, placeholder: 'e.g., Black, Silver', group: 'details', sort_order: 9, validation: { max: 50 } },
      { key: 'num_owners', label: 'Number of Previous Owners', type: 'number', required: false, group: 'optional', sort_order: 10, validation: { min: 0, max: 50 } },
      { key: 'registration_status', label: 'Registration Status', type: 'select', required: false, options: ['Registered', 'Unregistered', 'Export Only'], group: 'optional', sort_order: 11 },
      { key: 'inspection_valid_until', label: 'TÜV Valid Until', type: 'date', required: false, group: 'optional', sort_order: 12 },
      { key: 'vin', label: 'VIN', type: 'text', required: false, placeholder: 'Vehicle Identification Number', group: 'optional', sort_order: 13, validation: { max: 17 } },
      { key: 'insurance_valid_until', label: 'Insurance Valid Until', type: 'date', required: false, group: 'optional', sort_order: 14 },
      { key: 'service_history', label: 'Service History', type: 'select', required: false, options: ['Full', 'Partial', 'None'], group: 'optional', sort_order: 15 },
      { key: 'accessories', label: 'Accessories', type: 'textarea', required: false, placeholder: 'List included accessories...', group: 'optional', sort_order: 16, validation: { max: 1000 } },
    ])]);

    // Services
    await queryRunner.query(`
      UPDATE "classified_categories" SET "field_schema" = $1 WHERE "slug" = 'services'
    `, [JSON.stringify([
      { key: 'service_type', label: 'Service Type', type: 'select', required: true, options: ['Cleaning', 'Moving', 'Repair', 'Tutoring', 'IT Services', 'Beauty', 'Health', 'Legal', 'Financial', 'Translation', 'Photography', 'Design', 'Other'], group: 'basic', sort_order: 1, filterable: true, show_in_listing: true },
      { key: 'business_name', label: 'Business Name', type: 'text', required: false, placeholder: 'Your business name', group: 'basic', sort_order: 2, validation: { max: 200 } },
      { key: 'service_description', label: 'Service Details', type: 'textarea', required: false, placeholder: 'Describe your service in detail...', group: 'basic', sort_order: 3, validation: { max: 2000 } },
      { key: 'experience', label: 'Years of Experience', type: 'number', required: false, placeholder: 'e.g., 5', group: 'details', sort_order: 4, validation: { min: 0, max: 50 } },
      { key: 'service_area', label: 'Service Area', type: 'text', required: false, placeholder: 'e.g., All Berlin, Mitte only', group: 'details', sort_order: 5, validation: { max: 200 } },
      { key: 'hourly_rate', label: 'Hourly Rate (EUR)', type: 'number', required: false, placeholder: 'e.g., 25', group: 'details', sort_order: 6, validation: { min: 0 } },
      { key: 'min_service_fee', label: 'Minimum Service Fee (EUR)', type: 'number', required: false, group: 'details', sort_order: 7, validation: { min: 0 } },
      { key: 'availability', label: 'Availability', type: 'select', required: false, options: ['Weekdays', 'Weekends', 'Evenings', 'Flexible', '24/7'], group: 'details', sort_order: 8, filterable: true },
      { key: 'contact_method', label: 'Preferred Contact Method', type: 'select', required: false, options: ['Phone', 'Email', 'WhatsApp', 'Platform Message'], group: 'optional', sort_order: 9 },
      { key: 'certifications', label: 'Certifications', type: 'textarea', required: false, placeholder: 'List relevant certifications...', group: 'optional', sort_order: 10, validation: { max: 1000 } },
      { key: 'portfolio_links', label: 'Portfolio / References', type: 'url', required: false, placeholder: 'https://...', group: 'optional', sort_order: 11 },
      { key: 'business_website', label: 'Website', type: 'url', required: false, placeholder: 'https://...', group: 'optional', sort_order: 12 },
    ])]);

    // Property
    await queryRunner.query(`
      UPDATE "classified_categories" SET "field_schema" = $1 WHERE "slug" = 'property'
    `, [JSON.stringify([
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, options: ['Apartment', 'Room', 'Studio', 'House', 'Office', 'Commercial', 'Garage', 'Other'], group: 'basic', sort_order: 1, filterable: true, show_in_listing: true },
      { key: 'listing_type', label: 'Listing Type', type: 'select', required: true, options: ['For Rent', 'For Sale', 'Sublet', 'WG (Shared)'], group: 'basic', sort_order: 2, filterable: true, show_in_listing: true },
      { key: 'property_size_sqm', label: 'Size (m²)', type: 'number', required: true, placeholder: 'e.g., 65', group: 'basic', sort_order: 3, filterable: true, show_in_listing: true, validation: { min: 1, max: 10000 } },
      { key: 'bedrooms', label: 'Bedrooms', type: 'number', required: false, group: 'details', sort_order: 4, filterable: true, validation: { min: 0, max: 20 } },
      { key: 'bathrooms', label: 'Bathrooms', type: 'number', required: false, group: 'details', sort_order: 5, validation: { min: 0, max: 10 } },
      { key: 'floor_number', label: 'Floor', type: 'number', required: false, group: 'details', sort_order: 6, validation: { min: -3, max: 100 } },
      { key: 'total_floors', label: 'Total Floors in Building', type: 'number', required: false, group: 'details', sort_order: 7, validation: { min: 1, max: 100 } },
      { key: 'furnished', label: 'Furnished', type: 'select', required: false, options: ['Furnished', 'Partially Furnished', 'Unfurnished'], group: 'details', sort_order: 8, filterable: true },
      { key: 'parking', label: 'Parking', type: 'select', required: false, options: ['Included', 'Available', 'Street', 'None'], group: 'details', sort_order: 9 },
      { key: 'security_deposit', label: 'Security Deposit (EUR)', type: 'number', required: false, group: 'details', sort_order: 10, validation: { min: 0 } },
      { key: 'utilities_included', label: 'Utilities Included', type: 'boolean', required: false, group: 'details', sort_order: 11 },
      { key: 'available_from', label: 'Available From', type: 'date', required: false, group: 'details', sort_order: 12, filterable: true },
      { key: 'lease_duration', label: 'Lease Duration', type: 'select', required: false, options: ['1 month', '3 months', '6 months', '1 year', '2 years', 'Unlimited', 'Flexible'], group: 'optional', sort_order: 13 },
      { key: 'balcony', label: 'Balcony', type: 'boolean', required: false, group: 'optional', sort_order: 14 },
      { key: 'garden', label: 'Garden', type: 'boolean', required: false, group: 'optional', sort_order: 15 },
      { key: 'elevator', label: 'Elevator', type: 'boolean', required: false, group: 'optional', sort_order: 16 },
      { key: 'pet_friendly', label: 'Pet Friendly', type: 'boolean', required: false, group: 'optional', sort_order: 17, filterable: true },
    ])]);

    // Electronics
    await queryRunner.query(`
      UPDATE "classified_categories" SET "field_schema" = $1 WHERE "slug" = 'electronics'
    `, [JSON.stringify([
      { key: 'device_type', label: 'Device Type', type: 'select', required: true, options: ['Laptop', 'Desktop', 'Smartphone', 'Tablet', 'TV', 'Camera', 'Audio', 'Gaming', 'Wearable', 'Accessories', 'Other'], group: 'basic', sort_order: 1, filterable: true, show_in_listing: true },
      { key: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'e.g., Apple, Samsung', group: 'basic', sort_order: 2, filterable: true, show_in_listing: true, validation: { max: 100 } },
      { key: 'model', label: 'Model', type: 'text', required: false, placeholder: 'e.g., iPhone 15, Galaxy S24', group: 'basic', sort_order: 3, show_in_listing: true, validation: { max: 100 } },
      { key: 'condition', label: 'Device Condition', type: 'select', required: false, options: ['Like New', 'Good', 'Fair', 'For Parts'], group: 'details', sort_order: 4, filterable: true },
      { key: 'storage_capacity', label: 'Storage Capacity', type: 'text', required: false, placeholder: 'e.g., 256GB, 1TB', group: 'details', sort_order: 5, validation: { max: 50 } },
      { key: 'color', label: 'Color', type: 'text', required: false, placeholder: 'e.g., Black, Space Gray', group: 'details', sort_order: 6, validation: { max: 50 } },
      { key: 'warranty_status', label: 'Warranty Status', type: 'select', required: false, options: ['Under Warranty', 'Expired', 'Extended Warranty', 'None'], group: 'details', sort_order: 7 },
      { key: 'purchase_date', label: 'Purchase Date', type: 'date', required: false, group: 'optional', sort_order: 8 },
      { key: 'original_box', label: 'Original Box Included', type: 'boolean', required: false, group: 'optional', sort_order: 9 },
      { key: 'accessories', label: 'Included Accessories', type: 'textarea', required: false, placeholder: 'e.g., charger, case, earphones...', group: 'optional', sort_order: 10, validation: { max: 500 } },
      { key: 'reason_for_sale', label: 'Reason for Sale', type: 'text', required: false, placeholder: 'e.g., upgrading', group: 'optional', sort_order: 11, validation: { max: 200 } },
    ])]);

    // Furniture
    await queryRunner.query(`
      UPDATE "classified_categories" SET "field_schema" = $1 WHERE "slug" = 'furniture'
    `, [JSON.stringify([
      { key: 'furniture_type', label: 'Furniture Type', type: 'select', required: true, options: ['Sofa', 'Bed', 'Table', 'Chair', 'Desk', 'Wardrobe', 'Shelf', 'Cabinet', 'Lamp', 'Rug', 'Decor', 'Other'], group: 'basic', sort_order: 1, filterable: true, show_in_listing: true },
      { key: 'material', label: 'Material', type: 'select', required: false, options: ['Wood', 'Metal', 'Glass', 'Plastic', 'Fabric', 'Leather', 'Mixed', 'Other'], group: 'details', sort_order: 2, filterable: true },
      { key: 'condition', label: 'Furniture Condition', type: 'select', required: false, options: ['Like New', 'Good', 'Fair', 'Needs Repair'], group: 'details', sort_order: 3, filterable: true },
      { key: 'dimensions', label: 'Dimensions (L x W x H cm)', type: 'text', required: false, placeholder: 'e.g., 200 x 90 x 75', group: 'details', sort_order: 4, validation: { max: 100 } },
      { key: 'assembly_required', label: 'Assembly Required', type: 'boolean', required: false, group: 'details', sort_order: 5 },
      { key: 'delivery_available', label: 'Delivery Available', type: 'boolean', required: false, group: 'details', sort_order: 6, filterable: true },
      { key: 'brand', label: 'Brand', type: 'text', required: false, placeholder: 'e.g., IKEA, Hay', group: 'optional', sort_order: 7, validation: { max: 100 } },
      { key: 'purchase_date', label: 'Purchase Date', type: 'date', required: false, group: 'optional', sort_order: 8 },
      { key: 'color', label: 'Color', type: 'text', required: false, placeholder: 'e.g., White, Oak', group: 'optional', sort_order: 9, validation: { max: 50 } },
    ])]);

    // Jobs
    await queryRunner.query(`
      UPDATE "classified_categories" SET "field_schema" = $1 WHERE "slug" = 'jobs'
    `, [JSON.stringify([
      { key: 'job_title', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g., Software Engineer', group: 'basic', sort_order: 1, filterable: true, show_in_listing: true, validation: { max: 200 } },
      { key: 'company_name', label: 'Company Name', type: 'text', required: true, placeholder: 'Company name', group: 'basic', sort_order: 2, show_in_listing: true, validation: { max: 200 } },
      { key: 'job_type', label: 'Job Type', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Freelance', 'Internship', 'Mini-Job', 'Werkstudent', 'Contract'], group: 'basic', sort_order: 3, filterable: true, show_in_listing: true },
      { key: 'work_mode', label: 'Work Mode', type: 'select', required: false, options: ['On-site', 'Remote', 'Hybrid'], group: 'details', sort_order: 4, filterable: true },
      { key: 'salary_range', label: 'Salary Range', type: 'text', required: false, placeholder: 'e.g., 50,000 - 70,000 EUR/year', group: 'details', sort_order: 5, validation: { max: 100 } },
      { key: 'experience_required', label: 'Experience Required', type: 'select', required: false, options: ['Entry Level', '1-2 years', '3-5 years', '5-10 years', '10+ years'], group: 'details', sort_order: 6, filterable: true },
      { key: 'education_requirement', label: 'Education Requirement', type: 'select', required: false, options: ['None', 'High School', 'Vocational', 'Bachelor', 'Master', 'PhD'], group: 'details', sort_order: 7 },
      { key: 'job_description', label: 'Full Job Description', type: 'textarea', required: false, placeholder: 'Detailed job description, responsibilities, requirements...', group: 'details', sort_order: 8, validation: { max: 5000 } },
      { key: 'application_deadline', label: 'Application Deadline', type: 'date', required: false, group: 'optional', sort_order: 9 },
      { key: 'contact_email', label: 'Application Email', type: 'text', required: false, placeholder: 'jobs@company.com', group: 'optional', sort_order: 10, validation: { max: 200 } },
      { key: 'benefits', label: 'Benefits', type: 'textarea', required: false, placeholder: 'e.g., BVG ticket, gym membership...', group: 'optional', sort_order: 11, validation: { max: 1000 } },
      { key: 'visa_sponsorship', label: 'Visa Sponsorship', type: 'boolean', required: false, group: 'optional', sort_order: 12, filterable: true },
      { key: 'languages_required', label: 'Languages Required', type: 'text', required: false, placeholder: 'e.g., English (fluent), German (B2)', group: 'optional', sort_order: 13, validation: { max: 200 } },
    ])]);

    // "Other" category keeps empty schema (default [])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_classifieds_category_fields"`,
    );
    await queryRunner.query(
      `ALTER TABLE "classifieds" DROP COLUMN IF EXISTS "category_fields"`,
    );
    await queryRunner.query(
      `ALTER TABLE "classified_categories" DROP COLUMN IF EXISTS "field_schema"`,
    );
  }
}
