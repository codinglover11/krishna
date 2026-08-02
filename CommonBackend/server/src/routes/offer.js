const express = require('express');
const router = express.Router();

// Offer routes
router.get('/', (req, res) => {
  res.json({ offers: [] });
});

module.exports = router;
