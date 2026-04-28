import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './EventFormModal.css';

const INITIAL_FORM = {
    title: { tr: '', en: '', ar: '' },
    description: { tr: '', en: '', ar: '' },
    date: '',
    endDate: '',
    location: '',
    image: '',
    category: 'cultural',
    price: '',
};

function EventFormModal({ show, onClose, event, onSuccess }) {
    const { language } = useLanguage();
    const isEditing = !!event;

    const [activeTab, setActiveTab] = useState('tr');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Reset or populate form
    useEffect(() => {
        if (!show) {
            setFormData({ ...INITIAL_FORM, title: { tr: '', en: '', ar: '' }, description: { tr: '', en: '', ar: '' } });
            setImageFile(null);
            setImagePreview('');
            setActiveTab('tr');
            return;
        }
        if (event) {
            setFormData({
                title: event.title || { tr: '', en: '', ar: '' },
                description: event.description || { tr: '', en: '', ar: '' },
                date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
                endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
                location: event.location || '',
                image: event.image || '',
                category: event.category || 'cultural',
                price: event.price || '',
            });
            setImagePreview(event.image || '');
            setImageFile(null);
        } else {
            setFormData({ ...INITIAL_FORM, title: { tr: '', en: '', ar: '' }, description: { tr: '', en: '', ar: '' } });
            setImagePreview('');
            setImageFile(null);
        }
    }, [show, event]);

    const handleInputChange = (field, value, lang = null) => {
        if (lang) {
            setFormData(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, image: '' }));
    };

    const validateForm = () => {
        if (!formData.title.tr.trim() || !formData.title.en.trim()) {
            toast.error('Türkçe ve İngilizce başlık gerekli!');
            return false;
        }
        if (!formData.date) {
            toast.error('Etkinlik tarihi gerekli!');
            return false;
        }
        if (!formData.location.trim()) {
            toast.error('Etkinlik yeri gerekli!');
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
            fd.append('date', new Date(formData.date).toISOString());
            if (formData.endDate) fd.append('endDate', new Date(formData.endDate).toISOString());
            fd.append('location', formData.location);
            if (formData.category) fd.append('category', formData.category);
            if (formData.price) fd.append('price', formData.price);

            // Keep existing image if no new file
            if (imageFile) {
                fd.append('image', imageFile);
            } else if (formData.image) {
                fd.append('image', formData.image);
            } else {
                fd.append('image', '');
            }

            let response;
            if (isEditing) {
                response = await api.put(`/events/${event._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Etkinlik güncellendi!');
            } else {
                response = await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Etkinlik eklendi!');
            }
            onSuccess(response.data.data);
        } catch (error) {
            console.error('Error saving event:', error);
            const msg = error.response?.data?.message || 'Bir hata oluştu!';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const eventCategories = [
        { value: 'cultural', label: 'Kültürel' },
        { value: 'festival', label: 'Festival' },
        { value: 'sports', label: 'Spor' },
        { value: 'concert', label: 'Konser' },
        { value: 'exhibition', label: 'Sergi' },
    ];

    return (
        <div className="adm-modal-overlay" onClick={onClose}>
            <div className="adm-modal adm-modal--md" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="adm-modal__header">
                    <div className="adm-modal__header-left">
                        <span className="material-symbols-outlined">{isEditing ? 'edit_calendar' : 'calendar_add_on'}</span>
                        <h2>{isEditing ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}</h2>
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
                            <input className="adm-form-input" value={formData.title[activeTab]} onChange={(e) => handleInputChange('title', e.target.value, activeTab)} placeholder="Etkinlik adı" />
                        </div>
                        <div className="adm-form-group">
                            <label>Açıklama ({activeTab.toUpperCase()}) <span className="req">*</span></label>
                            <textarea className="adm-form-textarea" rows="3" value={formData.description[activeTab]} onChange={(e) => handleInputChange('description', e.target.value, activeTab)} placeholder="Etkinlik detayları" />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="adm-form-section">
                        <h4><span className="material-symbols-outlined">schedule</span> Tarih & Saat</h4>
                        <div className="adm-form-row">
                            <div className="adm-form-group">
                                <label>Başlangıç <span className="req">*</span></label>
                                <input type="datetime-local" className="adm-form-input" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
                            </div>
                            <div className="adm-form-group">
                                <label>Bitiş</label>
                                <input type="datetime-local" className="adm-form-input" value={formData.endDate} onChange={(e) => handleInputChange('endDate', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Category & Location & Price */}
                    <div className="adm-form-section">
                        <div className="adm-form-row">
                            <div className="adm-form-group">
                                <label>Kategori</label>
                                <select className="adm-form-input" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                                    {eventCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="adm-form-group">
                                <label>Ücret</label>
                                <input className="adm-form-input" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="Ücretsiz" />
                            </div>
                        </div>
                        <div className="adm-form-group">
                            <label>Konum <span className="req">*</span></label>
                            <input className="adm-form-input" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Etkinlik yeri" />
                        </div>
                    </div>

                    {/* Image */}
                    <div className="adm-form-section">
                        <h4><span className="material-symbols-outlined">image</span> Görsel</h4>
                        {!imagePreview ? (
                            <div className="adm-upload-zone">
                                <input type="file" id="event-img-upload" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                                <label htmlFor="event-img-upload" className="adm-upload-label">
                                    <span className="material-symbols-outlined">add_photo_alternate</span>
                                    <span>Görsel Yükle</span>
                                    <small>JPG, PNG, WebP — Maks. 10MB</small>
                                </label>
                            </div>
                        ) : (
                            <div className="adm-img-single">
                                <img src={resolveImg(imagePreview)} alt="Event preview" />
                                <button type="button" className="adm-img-remove" onClick={removeImage}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        )}
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

export default EventFormModal;
