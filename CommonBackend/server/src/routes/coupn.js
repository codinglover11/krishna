const express = require('express');
const router = express.Router();

// Coupon routes
router.get('/', (req, res) => {
  res.json({ coupons: [] });
});

module.exports = router;
