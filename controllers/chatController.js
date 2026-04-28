const Place = require('../models/Place');
require('express-async-errors');

// @desc    AI Chatbot - Search places based on query
// @route   POST /api/chat
// @access  Public
const chat = async (req, res) => {
    const { query } = req.body;

    // Perform text search on Place collection
    // Using MongoDB text search with indexes created in Place model
    const places = await Place.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
    )
        .sort({ score: { $meta: 'textScore' } })
        .limit(5); // Return top 5 matches

    // If no text search results, try simple regex search as fallback
    let recommendations = places;
    if (places.length === 0) {
        const regex = new RegExp(query, 'i'); // Case-insensitive
        recommendations = await Place.find({
            $or: [
                { 'title.tr': regex },
                { 'title.en': regex },
                { 'description.tr': regex },
                { 'description.en': regex },
            ],
        }).limit(5);
    }

    // Format response for AI chatbot
    const response = {
        success: true,
        message: recommendations.length > 0
            ? `I found ${recommendations.length} place(s) matching your query "${query}"`
            : `I couldn't find any places matching "${query}". Try searching for nature, history, beach, or specific place names.`,
        query: query,
        recommendations: recommendations.map((place) => ({
            id: place._id,
            title: place.title,
            description: place.description,
            category: place.category,
            location: place.location,
            rating: place.rating,
            images: place.images,
        })),
    };

    res.status(200).json(response);
};

module.exports = {
    chat,
};
