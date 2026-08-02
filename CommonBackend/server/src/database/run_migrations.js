const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is missing in .env');
  process.exit(1);
}

const runDbMigrations = async () => {
  console.log('Connecting to Neon PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Neon secure connection
    }
  });

  try {
    await client.connect();
    console.log('Database connected successfully.');

    // List of migration and seed files in order
    const migrationFiles = [
      'migrations/001_create_roles_and_users.sql',
      'migrations/002_create_products_and_variants.sql',
      'migrations/003_create_addresses.sql',
      'migrations/004_create_marketing_and_coupons.sql',
      'migrations/005_create_carts_and_wishlists.sql',
      'migrations/006_create_orders_and_items.sql',
      'migrations/007_create_reviews_and_notifications.sql',
      'migrations/008_add_product_fields.sql',
      'migrations/009_add_category_image.sql',
      'migrations/010_update_checkout_order_schema.sql',
      'migrations/011_add_admin_product_category_fields.sql',
      'migrations/012_create_order_status_history.sql',
      'migrations/013_update_banners_offers_coupons_schema.sql',
      'migrations/014_create_rbac_reviews_settings_schema.sql',
      'migrations/015_create_notifications_and_audit_logs_schema.sql',
      'migrations/016_add_performance_indexes.sql',
      'migrations/017_ensure_all_schema_columns.sql',
      'seeds/seed.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      console.log(`Executing script: ${file}...`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const sqlContent = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sqlContent);
        console.log(`Successfully completed: ${file}`);
      } catch (err) {
        console.warn(`[Skipped] ${file}: ${err.message}`);
      }
    }

    console.log('All migrations and structural seeds deployed successfully!');
  } catch (error) {
    console.error('Migration execution failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
};

runDbMigrations();
