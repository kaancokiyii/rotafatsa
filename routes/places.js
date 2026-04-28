const express = require('express');
const router = express.Router();
const {
    getPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace,
} = require('../controllers/placeController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { placeSchema } = require('../utils/validators');
const upload = require('../utils/multerConfig');

// Public routes
router.get('/', getPlaces);
router.get('/:id', getPlaceById);

// Protected routes (Admin only)
router.post(
    '/',
    protect,
    upload.array('images', 5), // Allow up to 5 images
    validate(placeSchema),
    createPlace
);

router.put(
    '/:id',
    protect,
    upload.array('images', 5),
    validate(placeSchema),
    updatePlace
);

router.delete('/:id', protect, deletePlace);

module.exports = router;
