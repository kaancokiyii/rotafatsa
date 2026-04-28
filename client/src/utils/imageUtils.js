// Resolve image URLs (supports /uploads/ paths and full URLs)
export const resolveImg = (src, defaultImg = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600') => {
    if (!src) return defaultImg;
    if (src.startsWith('http')) return src;
    // Map /uploads/... to backend URL
    if (src.startsWith('/uploads/')) return `http://localhost:5000${src}`;
    return src;
};
