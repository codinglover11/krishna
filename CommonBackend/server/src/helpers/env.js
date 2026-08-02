const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const getEnv = (key, fallback = '') => process.env[key] || fallback;

module.exports = {
  getEnv,
};
