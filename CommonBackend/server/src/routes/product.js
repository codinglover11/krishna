const express = require('express');
const router = express.Router();

// Product routes
router.get('/', (req, res) => {
  res.json({ products: [] });
});

module.exports = router;
