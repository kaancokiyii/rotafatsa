const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const validate = require('../middleware/validate');
const { chatSchema } = require('../utils/validators');

// Public route - AI Chatbot
router.post('/', validate(chatSchema), chat);

module.exports = router;
