const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        maxUploadSizeMB: {
            type: Number,
            default: 200,
            required: true,
        },
        maxImageCount: {
            type: Number,
            default: 50,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Settings', settingsSchema);
