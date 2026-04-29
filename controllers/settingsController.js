const Settings = require('../models/Settings');

exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        
        const { maxUploadSizeMB, maxImageCount } = req.body;
        
        if (maxUploadSizeMB) settings.maxUploadSizeMB = maxUploadSizeMB;
        if (maxImageCount) settings.maxImageCount = maxImageCount;
        
        await settings.save();
        
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};
