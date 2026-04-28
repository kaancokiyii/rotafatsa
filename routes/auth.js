const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginSchema } = require('../utils/validators');

// @route   POST /api/auth/login
router.post('/login', validate(loginSchema), login);

module.exports = router;
