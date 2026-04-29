const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { eventSchema } = require('../utils/validators');
const upload = require('../utils/multerConfig');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (Admin only)
router.post(
    '/',
    protect,
    upload('image', 1), // Single image upload
    validate(eventSchema),
    createEvent
);

router.put(
    '/:id',
    protect,
    upload('image', 1),
    validate(eventSchema),
    updateEvent
);

router.delete('/:id', protect, deleteEvent);

module.exports = router;
