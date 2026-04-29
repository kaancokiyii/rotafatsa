const Joi = require('joi');
const qs = require('qs');

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        // Reconstruct nested objects/arrays that FormData/multer flat-packed
        if (req.body && typeof req.body === 'object') {
            req.body = qs.parse(qs.stringify(req.body));
        }

        // Save file-related fields before validation (Joi may strip them)
        const savedImages = req.body.images;
        const savedImage = req.body.image;

        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: false, // Don't strip unknown fields (allow images etc.)
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        // Use validated value but keep images intact
        req.body = value;
        if (savedImages !== undefined) req.body.images = savedImages;
        if (savedImage !== undefined) req.body.image = savedImage;

        next();
    };
};

module.exports = validate;

