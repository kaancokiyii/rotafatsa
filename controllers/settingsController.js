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

        // Tüm gelen alanları güncelle
        const allowedFields = [
            'siteName', 'siteDescription', 'siteUrl', 'apiUrl',
            'domain', 'serverIp', 'sslEnabled',
            'contactEmail', 'contactPhone', 'contactAddress',
            'socialMedia',
            'maxUploadSizeMB', 'maxImageCount',
            'seoTitle', 'seoDescription', 'seoKeywords', 'googleAnalyticsId',
            'maintenanceMode', 'maintenanceMessage',
            'mapDefaultLat', 'mapDefaultLng', 'mapDefaultZoom',
            'chatbotEnabled', 'chatbotWelcomeMessage',
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        }

        await settings.save();

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

// Public endpoint - bakım modu kontrolü ve genel site bilgileri
exports.getPublicSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        // Sadece public bilgileri döndür
        const publicData = {
            siteName: settings.siteName,
            siteDescription: settings.siteDescription,
            contactEmail: settings.contactEmail,
            contactPhone: settings.contactPhone,
            contactAddress: settings.contactAddress,
            socialMedia: settings.socialMedia,
            maintenanceMode: settings.maintenanceMode,
            maintenanceMessage: settings.maintenanceMessage,
            mapDefaultLat: settings.mapDefaultLat,
            mapDefaultLng: settings.mapDefaultLng,
            mapDefaultZoom: settings.mapDefaultZoom,
            chatbotEnabled: settings.chatbotEnabled,
            chatbotWelcomeMessage: settings.chatbotWelcomeMessage,
        };

        res.status(200).json({ success: true, data: publicData });
    } catch (error) {
        next(error);
    }
};
