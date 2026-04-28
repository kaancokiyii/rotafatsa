const Event = require('../models/Event');
require('express-async-errors');

// @desc    Get all events (upcoming by default)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    const { upcoming = 'true' } = req.query;

    // Build query
    const query = {};
    if (upcoming === 'true') {
        query.date = { $gte: new Date() }; // Only future events
    }

    const events = await Event.find(query).sort({ date: 1 }); // Sort by date ascending

    res.status(200).json({
        success: true,
        count: events.length,
        data: events,
    });
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: 'Event not found',
        });
    }

    res.status(200).json({
        success: true,
        data: event,
    });
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
const createEvent = async (req, res) => {
    // Handle image upload if present
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
    });
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
const updateEvent = async (req, res) => {
    let event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: 'Event not found',
        });
    }

    // Handle image upload if present
    if (req.file) {
        req.body.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image === '') {
        // explicit clear
        req.body.image = '';
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event,
    });
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({
            success: false,
            message: 'Event not found',
        });
    }

    await event.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
        data: {},
    });
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};
