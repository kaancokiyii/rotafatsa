const Joi = require('joi');

// Multi-language field schema
const multiLangSchema = Joi.object({
    tr: Joi.string().required().messages({
        'string.empty': 'Turkish translation is required',
        'any.required': 'Turkish translation is required',
    }),
    en: Joi.string().required().messages({
        'string.empty': 'English translation is required',
        'any.required': 'English translation is required',
    }),
    ar: Joi.string().allow('').optional(),
});

// Login validation schema
const loginSchema = Joi.object({
    username: Joi.string().required().min(3).messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 3 characters long',
    }),
    password: Joi.string().required().min(6).messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
    }),
});

// Place creation/update validation schema
const placeSchema = Joi.object({
    title: multiLangSchema.required(),
    description: multiLangSchema.required(),
    category: Joi.string()
        .valid('history', 'nature', 'hotel', 'restaurant', 'transport')
        .required()
        .messages({
            'any.only': 'Category must be one of: history, nature, hotel, restaurant, transport',
            'any.required': 'Category is required',
        }),
    location: Joi.object({
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional(),
        coordinates: Joi.array().items(Joi.number()).optional(),
        address: Joi.string().allow('').optional(),
        type: Joi.string().allow('').optional(),
    }).required(),
    images: Joi.array().items(Joi.string().allow('')).single().optional(),
    rating: Joi.number().min(0).max(5).optional(),
    contact: Joi.object({
        phone: Joi.string().allow('').optional(),
        email: Joi.string().allow('').optional(),
        website: Joi.string().allow('').optional(),
    }).optional(),
    contactInfo: Joi.object({
        phone: Joi.string().allow('').optional(),
        website: Joi.string().uri().allow('').optional(),
    }).optional(),
}).options({ allowUnknown: true });

// Event creation validation schema
const eventSchema = Joi.object({
    title: multiLangSchema.required(),
    description: multiLangSchema.required(),
    date: Joi.date().required().messages({
        'any.required': 'Event date is required',
        'date.base': 'Invalid date format',
    }),
    endDate: Joi.date().allow(null, '').optional(),
    location: Joi.string().required().messages({
        'string.empty': 'Event location is required',
        'any.required': 'Event location is required',
    }),
    image: Joi.string().allow('').optional(),
    category: Joi.string().allow('').optional(),
    price: Joi.string().allow('').optional(),
}).options({ allowUnknown: true });

// Chat query validation schema
const chatSchema = Joi.object({
    query: Joi.string().required().min(1).messages({
        'string.empty': 'Query is required',
        'any.required': 'Query is required',
    }),
});

module.exports = {
    loginSchema,
    placeSchema,
    eventSchema,
    chatSchema,
};
