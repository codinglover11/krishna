# Database Architecture: Krishna Footwear

This directory contains the database design schemas, DDL creation scripts, structural migration modules, and standard metadata seeding keys for the **Neon PostgreSQL** serverless database.

## Folder Structure
```
CommonBackend/server/src/database/
├── README.md               # Setup and execution guide
├── schema.sql              # Consolidated schema design DDL
├── migrations/             # Incremental table migration scripts
│   ├── 001_create_roles_and_users.sql
│   ├── 002_create_products_and_variants.sql
│   ├── 003_create_addresses.sql
│   ├── 004_create_marketing_and_coupons.sql
│   ├── 005_create_carts_and_wishlists.sql
│   ├── 006_create_orders_and_items.sql
│   └── 007_create_reviews_and_notifications.sql
└── seeds/                  # Master structural configuration data
    └── seed.sql            # Core roles, sizes, colors, and category lookups
```

## How to Deploy on Neon PostgreSQL

### Step 1: Connect to your Postgres Client
Read the Postgres Database Connection URI from your `.env` configuration file:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

### Step 2: Run Schema Migrations
To build the complete tables and relations, execute the migration scripts sequentially against your active Postgres instance:
```bash
psql -d $DATABASE_URL -f migrations/001_create_roles_and_users.sql
psql -d $DATABASE_URL -f migrations/002_create_products_and_variants.sql
psql -d $DATABASE_URL -f migrations/003_create_addresses.sql
psql -d $DATABASE_URL -f migrations/004_create_marketing_and_coupons.sql
psql -d $DATABASE_URL -f migrations/005_create_carts_and_wishlists.sql
psql -d $DATABASE_URL -f migrations/006_create_orders_and_items.sql
psql -d $DATABASE_URL -f migrations/007_create_reviews_and_notifications.sql
```
*(Or run the consolidated `schema.sql` file directly: `psql -d $DATABASE_URL -f schema.sql`)*

### Step 3: Seed Lookup Metadata
Load the required metadata lookups (roles, shoe size measurements, primary shoe colors, and default store categories):
```bash
psql -d $DATABASE_URL -f seeds/seed.sql
```

## Normalization & Integrity
*   **3NF Standard**: The tables are fully normalized. Attributes like product stock, sizing details, and color variations are decoupled into a dedicated `product_variants` inventory system.
*   **Indices**: Custom database indices are configured for critical search keys (`email`, `sku`, `category_id`, `token`) to ensure fast queries.
*   **Constraints**: Primary keys use UUIDs for security. Tables implement `ON DELETE CASCADE` and `ON DELETE RESTRICT` rules to enforce referential integrity.
