const express = require('express');
const router = express.Router();
const {
    getMessages,
    createMessage,
    toggleReadStatus,
    deleteMessage,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route — anyone can send a message
router.post('/', createMessage);

// Protected routes (Admin only)
router.get('/', protect, getMessages);
router.put('/:id/read', protect, toggleReadStatus);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
