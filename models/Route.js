const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Route name is required'],
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Route type is required'],
            enum: {
                values: ['bus', 'dolmus', 'walking_tour'],
                message: '{VALUE} is not a valid route type',
            },
        },
        stops: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },
                time: {
                    type: String,
                    trim: true,
                },
                location: {
                    lat: {
                        type: Number,
                        required: true,
                    },
                    lng: {
                        type: Number,
                        required: true,
                    },
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Route', routeSchema);
