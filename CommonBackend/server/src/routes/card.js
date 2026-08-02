const express = require('express');
const router = express.Router();

// Card/Cart routes
router.get('/', (req, res) => {
  res.json({ items: [] });
});

module.exports = router;
