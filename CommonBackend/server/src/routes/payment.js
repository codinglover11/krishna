const express = require('express');
const router = express.Router();

// Payment routes
router.post('/process', (req, res) => {
  res.json({ success: true, transactionId: 'test_tx_123' });
});

module.exports = router;
