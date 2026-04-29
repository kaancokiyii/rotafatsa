import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './PlaceFormModal.css';

const INITIAL_FORM = {
    title: { tr: '', en: '', ar: '' },
    description: { tr: '', en: '', ar: '' },
    category: 'nature',
    location: { lat: 41.0289, lng: 37.4992, address: '' },
    images: [],
    contact: { phone: '', email: '', website: '' },
    rating: 4.5,
};

function PlaceFormModal({ show, onClose, place, onSuccess }) {
    const { language } = useLanguage();
    const isEditing = !!place;

    const [activeTab, setActiveTab] = useState('tr');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    // Initialize Map
    useEffect(() => {
        if (!show) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
            return;
        }

        const initTimer = setTimeout(() => {
            if (mapRef.current && !mapInstanceRef.current) {
                const initLat = formData.location.lat || 41.0289;
                const initLng = formData.location.lng || 37.4992;

                const map = L.map(mapRef.current, {
                    center: [initLat, initLng],
                    zoom: 14,
                    zoomControl: true,
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 20,
                }).addTo(map);

                // Custom admin marker icon
                const customIcon = L.divIcon({
                    className: 'custom-admin-marker',
                    html: `
                        <div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); border: 2px solid white;">
                            <span class="material-symbols-outlined" style="transform: rotate(45deg); color: white; font-size: 18px;">place</span>
                        </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                markerRef.current = L.marker([initLat, initLng], { draggable: true, icon: customIcon }).addTo(map);

                // Drag marker updates coordinates
                markerRef.current.on('dragend', (e) => {
                    const pos = e.target.getLatLng();
                    handleLocationChange('lat', pos.lat.toFixed(6));
                    handleLocationChange('lng', pos.lng.toFixed(6));
                });

                // Click map moves marker and updates coordinates
                map.on('click', (e) => {
                    const pos = e.latlng;
                    markerRef.current.setLatLng(pos);
                    handleLocationChange('lat', pos.lat.toFixed(6));
                    handleLocationChange('lng', pos.lng.toFixed(6));
                });

                mapInstanceRef.current = map;

                // Fix map render size issue
                setTimeout(() => map.invalidateSize(), 100);
            }
        }, 100);

        return () => clearTimeout(initTimer);
    }, [show]);

    // Update marker if lat/lng inputs change manually
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current && show) {
            const lat = parseFloat(formData.location.lat);
            const lng = parseFloat(formData.location.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    markerRef.current.setLatLng([lat, lng]);
                    mapInstanceRef.current.setView([lat, lng]);
                }
            }
        }
    }, [formData.location.lat, formData.location.lng, show]);

    // Reset or populate form when show/place changes
    useEffect(() => {
        if (!show) {
            // Reset on close
            setFormData({ ...INITIAL_FORM, title: { tr: '', en: '', ar: '' }, description: { tr: '', en: '', ar: '' } });
            setImageFiles([]);
            setImagePreviews([]);
            setActiveTab('tr');
            return;
        }
        if (place) {
            setFormData({
                title: place.title || { tr: '', en: '', ar: '' },
                description: place.description || { tr: '', en: '', ar: '' },
                category: place.category || 'nature',
                location: {
                    lat: place.location?.coordinates?.[1] || place.location?.lat || 41.0289,
                    lng: place.location?.coordinates?.[0] || place.location?.lng || 37.4992,
                    address: place.location?.address || '',
                },
                images: place.images || [],
                contact: place.contact || { phone: '', email: '', website: '' },
                rating: place.rating || 4.5,
            });
            setImagePreviews(place.images || []);
            setImageFiles([]);
        } else {
            setFormData({ ...INITIAL_FORM, title: { tr: '', en: '', ar: '' }, description: { tr: '', en: '', ar: '' } });
            setImagePreviews([]);
            setImageFiles([]);
        }
    }, [show, place]);

    const handleInputChange = (field, value, lang = null) => {
        if (lang) {
            setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleContactChange = (field, value) => {
        setFormData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
    };

    const handleLocationChange = (field, value) => {
        setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: field === 'address' ? value : (parseFloat(value) || 0) } }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const processFiles = (files) => {
        setImageFiles(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
            reader.readAsDataURL(file);
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFiles(files);
        }
    };

    const removeImage = (index) => {
        // If removing an existing image (URL string), remove from formData.images too
        const existingCount = formData.images.length;
        if (index < existingCount) {
            setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
            setImagePreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            // Remove a new file
            const fileIndex = index - existingCount;
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
            setImagePreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Drag & Drop reorder handlers
    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragEnter = (index) => {
        if (dragIndex === null || dragIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const existingCount = formData.images.length;

        // Reorder previews
        const newPreviews = [...imagePreviews];
        const [movedPreview] = newPreviews.splice(dragIndex, 1);
        newPreviews.splice(dragOverIndex, 0, movedPreview);
        setImagePreviews(newPreviews);

        // Reorder existing images in formData
        const newExistingImages = [...formData.images];
        const newImageFiles = [...imageFiles];

        // Build a combined list, reorder, then split back
        const combined = [
            ...newExistingImages.map(img => ({ type: 'existing', value: img })),
            ...newImageFiles.map(file => ({ type: 'file', value: file })),
        ];
        const [movedItem] = combined.splice(dragIndex, 1);
        combined.splice(dragOverIndex, 0, movedItem);

        const reorderedExisting = combined.filter(c => c.type === 'existing').map(c => c.value);
        const reorderedFiles = combined.filter(c => c.type === 'file').map(c => c.value);

        setFormData(prev => ({ ...prev, images: reorderedExisting }));
        setImageFiles(reorderedFiles);

        setDragIndex(null);
        setDragOverIndex(null);
    };

    const validateForm = () => {
        if (!formData.title.tr.trim() || !formData.title.en.trim()) {
            toast.error('Türkçe ve İngilizce başlık gerekli!');
            return false;
        }
        if (!formData.description.tr.trim() || !formData.description.en.trim()) {
            toast.error('Türkçe ve İngilizce açıklama gerekli!');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('title[tr]', formData.title.tr);
            fd.append('title[en]', formData.title.en);
            fd.append('title[ar]', formData.title.ar || formData.title.en);
            fd.append('description[tr]', formData.description.tr);
            fd.append('description[en]', formData.description.en);
            fd.append('description[ar]', formData.description.ar || formData.description.en);
            fd.append('category', formData.category);
            fd.append('location[lat]', formData.location.lat);
            fd.append('location[lng]', formData.location.lng);
            fd.append('location[address]', formData.location.address);
            fd.append('rating', formData.rating);

            if (formData.contact.phone) fd.append('contact[phone]', formData.contact.phone);
            if (formData.contact.email) fd.append('contact[email]', formData.contact.email);
            if (formData.contact.website) fd.append('contact[website]', formData.contact.website);

            // Handle Images
            if (formData.images.length === 0 && imageFiles.length === 0) {
                fd.append('images', ''); // explicitly clear
            } else {
                formData.images.forEach(img => {
                    if (typeof img === 'string') fd.append('images', img);
                });
                imageFiles.forEach(file => fd.append('images', file));
            }

            let response;
            if (isEditing) {
                response = await api.put(`/places/${place._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Yer güncellendi!');
            } else {
                response = await api.post('/places', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Yer eklendi!');
            }
            onSuccess(response.data.data);
        } catch (error) {
            console.error('Error saving place:', error);
            const msg = error.response?.data?.errors?.join(', ') || error.response?.data?.message || 'Bir hata oluştu!';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const categories = [
        { value: 'history', icon: 'history_edu', label: 'Tarihi' },
        { value: 'nature', icon: 'forest', label: 'Doğa' },
        { value: 'hotel', icon: 'hotel', label: 'Otel' },
        { value: 'restaurant', icon: 'restaurant', label: 'Restoran' },
        { value: 'transport', icon: 'directions', label: 'Ulaşım' },
    ];

    return (
        <div className="adm-modal-overlay" onClick={onClose}>
            <div className="adm-modal adm-modal--lg" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="adm-modal__header">
                    <div className="adm-modal__header-left">
                        <span className="material-symbols-outlined">{isEditing ? 'edit_location' : 'add_location'}</span>
                        <h2>{isEditing ? 'Yer Düzenle' : 'Yeni Yer Ekle'}</h2>
                    </div>
                    <button className="adm-modal__close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <form className="adm-modal__body" onSubmit={handleSubmit}>
                    {/* Language Tabs */}
                    <div className="adm-lang-tabs">
                        {[{ code: 'tr', flag: '🇹🇷', name: 'Türkçe' }, { code: 'en', flag: '🇬🇧', name: 'English' }].map(l => (
                            <button key={l.code} type="button" className={`adm-lang-tab ${activeTab === l.code ? 'active' : ''}`} onClick={() => setActiveTab(l.code)}>
                                {l.flag} {l.name}
                            </button>
                        ))}
                    </div>

                    {/* Title & Description */}
                    <div className="adm-form-section">
                        <div className="adm-form-group">
                            <label>Başlık ({activeTab.toUpperCase()}) <span className="req">*</span></label>
                            <input className="adm-form-input" value={formData.title[activeTab]} onChange={(e) => handleInputChange('title', e.target.value, activeTab)} placeholder="Yer adını girin" />
                        </div>
                        <div className="adm-form-group">
                            <label>Açıklama ({activeTab.toUpperCase()}) <span className="req">*</span></label>
                            <textarea className="adm-form-textarea" rows="4" value={formData.description[activeTab]} onChange={(e) => handleInputChange('description', e.target.value, activeTab)} placeholder="Detaylı açıklama girin" />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="adm-form-section">
                        <label>Kategori <span className="req">*</span></label>
                        <div className="adm-cat-grid">
                            {categories.map(cat => (
                                <button key={cat.value} type="button" className={`adm-cat-btn ${formData.category === cat.value ? 'active' : ''}`} onClick={() => handleInputChange('category', cat.value)}>
                                    <span className="material-symbols-outlined">{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="adm-form-section">
                        <h4><span className="material-symbols-outlined">pin_drop</span> Konum</h4>
                        <p className="adm-form-hint">Harita üzerinden seçebilir veya değerleri manuel girebilirsiniz.</p>
                        <div className="adm-map-selector-container">
                            <div ref={mapRef} className="adm-map-selector"></div>
                        </div>
                        <div className="adm-form-row">
                            <div className="adm-form-group">
                                <label>Enlem</label>
                                <input type="number" step="0.000001" className="adm-form-input" value={formData.location.lat} onChange={(e) => handleLocationChange('lat', e.target.value)} placeholder="41.0289" />
                            </div>
                            <div className="adm-form-group">
                                <label>Boylam</label>
                                <input type="number" step="0.000001" className="adm-form-input" value={formData.location.lng} onChange={(e) => handleLocationChange('lng', e.target.value)} placeholder="37.4992" />
                            </div>
                        </div>
                        <div className="adm-form-group">
                            <label>Adres</label>
                            <input className="adm-form-input" value={formData.location.address} onChange={(e) => handleLocationChange('address', e.target.value)} placeholder="Tam adres" />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="adm-form-section">
                        <h4><span className="material-symbols-outlined">photo_library</span> Görseller</h4>
                        <div 
                            className={`adm-upload-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input type="file" id="place-img-upload" multiple accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                            <label htmlFor="place-img-upload" className="adm-upload-label">
                                <span className="material-symbols-outlined">
                                    {isDragging ? 'upload_file' : 'add_photo_alternate'}
                                </span>
                                <span>{isDragging ? 'Bırakın ve Yükleyin' : 'Görsel Yükle veya Sürükle'}</span>
                                <small>JPG, PNG, WebP — Maks. 10MB</small>
                            </label>
                        </div>
                        {imagePreviews.length > 0 && (
                            <>
                                <p className="adm-form-hint" style={{ marginTop: '0', marginBottom: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>drag_indicator</span>
                                    Sıralamayı değiştirmek için görselleri sürükleyip bırakın. İlk görsel kapak fotoğrafı olur.
                                </p>
                                <div className="adm-img-previews">
                                    {imagePreviews.map((preview, i) => (
                                        <div
                                            key={i}
                                            className={`adm-img-preview ${dragIndex === i ? 'adm-img-preview--dragging' : ''} ${dragOverIndex === i ? 'adm-img-preview--dragover' : ''} ${i === 0 ? 'adm-img-preview--cover' : ''}`}
                                            draggable
                                            onDragStart={() => handleDragStart(i)}
                                            onDragEnter={() => handleDragEnter(i)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <img src={resolveImg(preview)} alt="" />
                                            <div className="adm-img-drag-handle">
                                                <span className="material-symbols-outlined">drag_indicator</span>
                                            </div>
                                            {i === 0 && <span className="adm-img-cover-badge">Kapak</span>}
                                            <span className="adm-img-order">{i + 1}</span>
                                            <button type="button" className="adm-img-remove" onClick={() => removeImage(i)}>
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="adm-form-section">
                        <h4><span className="material-symbols-outlined">contact_phone</span> İletişim</h4>
                        <div className="adm-form-row">
                            <div className="adm-form-group">
                                <label>Telefon</label>
                                <input className="adm-form-input" value={formData.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} placeholder="+90 555 123 4567" />
                            </div>
                            <div className="adm-form-group">
                                <label>E-posta</label>
                                <input className="adm-form-input" value={formData.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} placeholder="info@example.com" />
                            </div>
                        </div>
                        <div className="adm-form-group">
                            <label>Website</label>
                            <input className="adm-form-input" value={formData.contact.website} onChange={(e) => handleContactChange('website', e.target.value)} placeholder="https://example.com" />
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="adm-form-section">
                        <div className="adm-form-group">
                            <label>Değerlendirme</label>
                            <div className="adm-rating-input">
                                <input type="range" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))} />
                                <span className="adm-rating-value">
                                    <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>star</span>
                                    {formData.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="adm-modal__footer">
                        <button type="button" className="adm-modal-btn adm-modal-btn--secondary" onClick={onClose} disabled={loading}>İptal</button>
                        <button type="submit" className="adm-modal-btn adm-modal-btn--primary" disabled={loading}>
                            {loading ? (
                                <><span className="adm-spinner-sm"></span> Kaydediliyor...</>
                            ) : (
                                <><span className="material-symbols-outlined">{isEditing ? 'save' : 'add'}</span> {isEditing ? 'Güncelle' : 'Ekle'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PlaceFormModal;
