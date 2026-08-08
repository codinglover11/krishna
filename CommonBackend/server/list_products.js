require('dotenv').config({path: '../../.env'});
const { pool } = require('./src/config/db');
pool.query('SELECT id, name, slug FROM products').then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
