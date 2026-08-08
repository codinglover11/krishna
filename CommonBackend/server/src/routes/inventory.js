const { Router } = require('express');
const inventoryController = require('../controller/inventoryController');
const authenticateToken = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = Router();

// Protect inventory management with admin authorization
router.use(authenticateToken);
router.use(adminMiddleware);

router.get('/', inventoryController.getInventory);
router.get('/metadata', inventoryController.getLookupMetadata);
router.post('/metadata/sizes', inventoryController.createSize);
router.post('/metadata/colors', inventoryController.createColor);
router.patch('/variants/:variantId', inventoryController.updateVariantStock);

module.exports = router;
