require('dotenv').config({path: '../../.env'});
const { pool } = require('./src/config/db');
const fs = require('fs');

async function run() {
  try {
    const products = await pool.query('SELECT id, name, slug, created_at, updated_at FROM products');
    const images = await pool.query('SELECT id, product_id, image_url, color_id FROM product_images');
    const variants = await pool.query('SELECT id, product_id, size_id, color_id FROM product_variants');
    
    const output = {
      products: products.rows,
      images: images.rows,
      variants: variants.rows
    };
    
    fs.writeFileSync('../../artifacts/db_dump.json', JSON.stringify(output, null, 2));
    console.log("Dump successful");
    process.exit(0);
  } catch (err) {
    console.error(err);
    fs.writeFileSync('../../artifacts/db_dump.json', JSON.stringify({error: err.message}));
    process.exit(1);
  }
}
run();
