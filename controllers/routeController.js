const Route = require('../models/Route');
require('express-async-errors');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res) => {
    const { type } = req.query;

    // Build query
    const query = {};
    if (type) {
        query.type = type;
    }

    const routes = await Route.find(query).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: routes.length,
        data: routes,
    });
};

// @desc    Get single route by ID
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res) => {
    const route = await Route.findById(req.params.id);

    if (!route) {
        return res.status(404).json({
            success: false,
            message: 'Route not found',
        });
    }

    res.status(200).json({
        success: true,
        data: route,
    });
};

module.exports = {
    getRoutes,
    getRouteById,
};
