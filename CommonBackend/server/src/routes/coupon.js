const express = require('express');
const router = express.Router();

// Coupon routes (fallback)
router.get('/', (req, res) => {
  res.json({ coupons: [] });
});

module.exports = router;
