const Place = require('../models/Place');
require('express-async-errors');

// @desc    Get all places with optional filtering
// @route   GET /api/places
// @access  Public
const getPlaces = async (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (category) {
        query.category = category;
    }

    // Execute query with pagination
    const places = await Place.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    // Get total count for pagination
    const count = await Place.countDocuments(query);

    res.status(200).json({
        success: true,
        count: places.length,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: places,
    });
};

// @desc    Get single place by ID
// @route   GET /api/places/:id
// @access  Public
const getPlaceById = async (req, res) => {
    const place = await Place.findById(req.params.id);

    if (!place) {
        return res.status(404).json({
            success: false,
            message: 'Place not found',
        });
    }

    res.status(200).json({
        success: true,
        data: place,
    });
};

// @desc    Create new place
// @route   POST /api/places
// @access  Private (Admin)
const createPlace = async (req, res) => {
    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const place = await Place.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Place created successfully',
        data: place,
    });
};

// @desc    Update place
// @route   PUT /api/places/:id
// @access  Private (Admin)
const updatePlace = async (req, res) => {
    let place = await Place.findById(req.params.id);

    if (!place) {
        return res.status(404).json({
            success: false,
            message: 'Place not found',
        });
    }

    // Handle image updates
    if (req.body.images !== undefined || (req.files && req.files.length > 0)) {
        let finalImages = req.body.images !== undefined ? req.body.images : place.images;
        if (!Array.isArray(finalImages)) finalImages = [finalImages];
        finalImages = finalImages.filter(img => img && img.trim() !== '');

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file) => `/uploads/${file.filename}`);
            finalImages = [...finalImages, ...newImages];
        }

        req.body.images = finalImages;
    }

    place = await Place.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Place updated successfully',
        data: place,
    });
};

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private (Admin)
const deletePlace = async (req, res) => {
    const place = await Place.findById(req.params.id);

    if (!place) {
        return res.status(404).json({
            success: false,
            message: 'Place not found',
        });
    }

    await place.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Place deleted successfully',
        data: {},
    });
};

module.exports = {
    getPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace,
};
