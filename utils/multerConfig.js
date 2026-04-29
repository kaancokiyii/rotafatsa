const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Upload directory
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Dynamic upload wrapper
const uploadDynamic = (field, maxCount) => {
    return async (req, res, next) => {
        try {
            let maxSizeMB = 200; // default 200MB
            
            try {
                // Try to get dynamic settings if Settings model is implemented
                const SettingsModel = require('../models/Settings');
                const settings = await SettingsModel.findOne();
                if (settings && settings.maxUploadSizeMB) {
                    maxSizeMB = settings.maxUploadSizeMB;
                }
            } catch (err) {
                // Ignore if Settings model not yet created or DB error
            }

            const upload = multer({
                storage: storage,
                limits: { fileSize: maxSizeMB * 1024 * 1024 },
                fileFilter: fileFilter,
            });

            let multerMiddleware;
            if (maxCount === 1) {
                multerMiddleware = upload.single(field);
            } else if (maxCount > 1) {
                multerMiddleware = upload.array(field, maxCount);
            } else {
                multerMiddleware = upload.any();
            }

            multerMiddleware(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                        return res.status(400).json({ success: false, message: 'Beklenmeyen dosya alanı veya çok fazla dosya yüklediniz.' });
                    }
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ success: false, message: `Dosya boyutu çok büyük. Maksimum limit: ${maxSizeMB}MB` });
                    }
                    return res.status(400).json({ success: false, message: err.message });
                } else if (err) {
                    return res.status(400).json({ success: false, message: err.message });
                }
                next();
            });
        } catch (error) {
            next(error);
        }
    };
};

module.exports = uploadDynamic;
