import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreTables1710000009000 implements MigrationInterface {
  name = 'CreateStoreTables1710000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product status enum
    await queryRunner.query(`
      CREATE TYPE "product_status_enum" AS ENUM ('draft', 'active', 'archived')
    `);

    // Create order status enum
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    `);

    // Create discount type enum
    await queryRunner.query(`
      CREATE TYPE "discount_type_enum" AS ENUM ('percentage', 'fixed')
    `);

    // Create product_categories table
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "description" text,
        "image_url" character varying(500),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_categories_slug" UNIQUE ("slug")
      )
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category_id" uuid,
        "name" character varying(255) NOT NULL,
        "slug" character varying(300) NOT NULL,
        "description" text NOT NULL,
        "short_description" character varying(500),
        "base_price" decimal(10,2) NOT NULL,
        "compare_at_price" decimal(10,2),
        "sku" character varying(100),
        "status" "product_status_enum" NOT NULL DEFAULT 'draft',
        "is_featured" boolean NOT NULL DEFAULT false,
        "is_digital" boolean NOT NULL DEFAULT false,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "sort_order" integer NOT NULL DEFAULT 0,
        "meta_title" character varying(255),
        "meta_description" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL
      )
    `);

    // Create product_variants table
    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "name" character varying(200) NOT NULL,
        "sku" character varying(100) NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_variants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_variants_sku" UNIQUE ("sku"),
        CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create product_images table
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "url" character varying(500) NOT NULL,
        "thumbnail_url" character varying(500),
        "alt_text" character varying(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_images_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create carts table
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "session_id" character varying(255),
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_carts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_carts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create cart_items table
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "cart_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "variant_id" uuid,
        "quantity" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid,
        "order_number" character varying(50) NOT NULL,
        "status" "order_status_enum" NOT NULL DEFAULT 'pending',
        "subtotal" decimal(10,2) NOT NULL,
        "discount_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "tax_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "shipping_amount" decimal(10,2) NOT NULL DEFAULT 0,
        "total" decimal(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'EUR',
        "payment_intent_id" character varying(255),
        "payment_method" character varying(100),
        "shipping_name" character varying(200),
        "shipping_email" character varying(255),
        "shipping_address" text,
        "shipping_city" character varying(200),
        "shipping_postal_code" character varying(20),
        "shipping_country" character varying(100),
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "variant_id" uuid,
        "product_name" character varying(255) NOT NULL,
        "variant_name" character varying(200),
        "price" decimal(10,2) NOT NULL,
        "quantity" integer NOT NULL,
        "total" decimal(10,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
      )
    `);

    // Create discount_codes table
    await queryRunner.query(`
      CREATE TABLE "discount_codes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(50) NOT NULL,
        "description" text,
        "type" "discount_type_enum" NOT NULL DEFAULT 'percentage',
        "value" decimal(10,2) NOT NULL,
        "min_order_amount" decimal(10,2),
        "max_uses" integer,
        "used_count" integer NOT NULL DEFAULT 0,
        "starts_at" TIMESTAMP WITH TIME ZONE,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discount_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_discount_codes_code" UNIQUE ("code")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_product_categories_slug" ON "product_categories" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_categories_sort_order" ON "product_categories" ("sort_order")`);

    await queryRunner.query(`CREATE INDEX "IDX_products_slug" ON "products" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_status" ON "products" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_is_featured" ON "products" ("is_featured")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_base_price" ON "products" ("base_price")`);

    await queryRunner.query(`CREATE INDEX "IDX_product_variants_product_id" ON "product_variants" ("product_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_product_images_product_id" ON "product_images" ("product_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_carts_user_id" ON "carts" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_carts_session_id" ON "carts" ("session_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_cart_items_cart_id" ON "cart_items" ("cart_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_order_number" ON "orders" ("order_number")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_discount_codes_code" ON "discount_codes" ("code")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "product_images"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP TABLE "discount_codes"`);
    await queryRunner.query(`DROP TYPE "discount_type_enum"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TYPE "product_status_enum"`);
  }
}
