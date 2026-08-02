const { Router } = require('express');
const addressController = require('../controller/addressController');
const authenticateToken = require('../middleware/auth');

const router = Router();

// Secure all endpoints with authentication token verification
router.use(authenticateToken);

router.post('/', addressController.createAddress);
router.get('/', addressController.getAddresses);
router.patch('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
