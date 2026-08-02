const express = require('express');
const router = express.Router();

// Dashboard routes
router.get('/stats', (req, res) => {
  res.json({ stats: {} });
});

module.exports = router;
