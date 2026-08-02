const express = require('express');
const router = express.Router();

// Category routes
router.get('/', (req, res) => {
  res.json({ categories: [] });
});

module.exports = router;
