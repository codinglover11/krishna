const express = require('express');
const router = express.Router();

// Banner routes
router.get('/', (req, res) => {
  res.json({ banners: [] });
});

module.exports = router;
