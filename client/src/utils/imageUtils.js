// Resolve image URLs (supports /uploads/ paths and full URLs)
// Uses relative URLs so it works on both localhost and production servers
const API_BASE = import.meta.env.VITE_API_URL || '';

export const resolveImg = (src, defaultImg = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600') => {
    if (!src) return defaultImg;
    if (src.startsWith('http')) return src;
    if (src.startsWith('data:')) return src; // base64 previews
    // For /uploads/... paths, prepend API base (empty string in production = relative URL)
    if (src.startsWith('/uploads/')) return `${API_BASE}${src}`;
    return src;
};
