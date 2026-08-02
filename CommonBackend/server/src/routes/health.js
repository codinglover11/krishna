const { Router } = require('express');
const { getHealth } = require('../controllers/healthController');
const { validate, createValidationSchemas } = require('../middleware/validation');

const router = Router();

router.get('/', validate(createValidationSchemas().health), getHealth);

module.exports = router;
