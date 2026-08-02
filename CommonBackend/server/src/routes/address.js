const express = require('express');
const router = express.Router();

// Address routes
router.get('/', (req, res) => {
  res.json({ addresses: [] });
});

module.exports = router;
