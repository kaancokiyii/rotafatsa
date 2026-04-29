const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// Public endpoint (bakım modu kontrolü vs.)
router.get('/public', getPublicSettings);

// Protected endpoints (admin only)
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);

module.exports = router;
