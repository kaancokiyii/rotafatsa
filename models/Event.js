const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
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
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        location: {
            type: String,
            required: [true, 'Event location is required'],
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index for querying upcoming events
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
