const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        // ── Genel Site Ayarları ──
        siteName: {
            type: String,
            default: 'Rota Fatsa',
        },
        siteDescription: {
            type: String,
            default: 'Fatsa Turizm & Gezi Rehberi',
        },
        siteUrl: {
            type: String,
            default: 'http://localhost:5173',
        },
        apiUrl: {
            type: String,
            default: 'http://localhost:5000',
        },
        // Domain / IP yapılandırması
        domain: {
            type: String,
            default: '',
        },
        serverIp: {
            type: String,
            default: '',
        },
        sslEnabled: {
            type: Boolean,
            default: false,
        },

        // ── İletişim Bilgileri ──
        contactEmail: {
            type: String,
            default: '',
        },
        contactPhone: {
            type: String,
            default: '',
        },
        contactAddress: {
            type: String,
            default: 'Fatsa, Ordu',
        },

        // ── Sosyal Medya ──
        socialMedia: {
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' },
            twitter: { type: String, default: '' },
            youtube: { type: String, default: '' },
            tiktok: { type: String, default: '' },
        },

        // ── Yükleme Limitleri ──
        maxUploadSizeMB: {
            type: Number,
            default: 200,
            required: true,
        },
        maxImageCount: {
            type: Number,
            default: 50,
            required: true,
        },

        // ── SEO Ayarları ──
        seoTitle: {
            type: String,
            default: '',
        },
        seoDescription: {
            type: String,
            default: '',
        },
        seoKeywords: {
            type: String,
            default: '',
        },
        googleAnalyticsId: {
            type: String,
            default: '',
        },

        // ── Bakım Modu ──
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        maintenanceMessage: {
            type: String,
            default: 'Site şu anda bakım modundadır. Lütfen daha sonra tekrar deneyin.',
        },

        // ── Harita Ayarları ──
        mapDefaultLat: {
            type: Number,
            default: 41.0442,
        },
        mapDefaultLng: {
            type: Number,
            default: 37.4975,
        },
        mapDefaultZoom: {
            type: Number,
            default: 13,
        },

        // ── Chatbot Ayarları ──
        chatbotEnabled: {
            type: Boolean,
            default: true,
        },
        chatbotWelcomeMessage: {
            type: String,
            default: 'Merhaba! Fatsa hakkında size nasıl yardımcı olabilirim?',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Settings', settingsSchema);
