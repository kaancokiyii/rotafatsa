const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
    {
        title: {
            tr: {
                type: String,
                required: [true, 'Turkish title is required'],
                trim: true,
            },
            en: {
                type: String,
                required: [true, 'English title is required'],
                trim: true,
            },
            ar: {
                type: String,
                required: [true, 'Arabic title is required'],
                trim: true,
            },
        },
        description: {
            tr: {
                type: String,
                required: [true, 'Turkish description is required'],
            },
            en: {
                type: String,
                required: [true, 'English description is required'],
            },
            ar: {
                type: String,
                required: [true, 'Arabic description is required'],
            },
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: ['history', 'nature', 'hotel', 'restaurant', 'transport'],
                message: '{VALUE} is not a valid category',
            },
        },
        location: {
            lat: {
                type: Number,
                required: [true, 'Latitude is required'],
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90'],
            },
            lng: {
                type: Number,
                required: [true, 'Longitude is required'],
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180'],
            },
            address: {
                type: String,
                trim: true,
            },
        },
        images: {
            type: [String],
            default: [],
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be at least 0'],
            max: [5, 'Rating cannot exceed 5'],
        },
        contactInfo: {
            phone: {
                type: String,
                trim: true,
            },
            website: {
                type: String,
                trim: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
placeSchema.index({ category: 1 });
placeSchema.index({ rating: -1 });
placeSchema.index({ 'title.tr': 'text', 'title.en': 'text', 'description.tr': 'text', 'description.en': 'text' });

module.exports = mongoose.model('Place', placeSchema);
