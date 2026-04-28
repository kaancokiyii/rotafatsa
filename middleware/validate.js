const Joi = require('joi');
const qs = require('qs');

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        // Reconstruct nested objects/arrays that FormData/multer flat-packed
        if (req.body && typeof req.body === 'object') {
            req.body = qs.parse(qs.stringify(req.body));
        }

        const { error } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
        }

        next();
    };
};

module.exports = validate;
