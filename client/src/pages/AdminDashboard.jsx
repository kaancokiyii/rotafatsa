import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import PlaceFormModal from '../components/PlaceFormModal';
import EventFormModal from '../components/EventFormModal';
import './AdminDashboard.css';

import { resolveImg } from '../utils/imageUtils';

function AdminDashboard() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language]?.admin || {};
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [places, setPlaces] = useState([]);
    const [events, setEvents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Rota Fatsa',
        siteDescription: 'Fatsa Turizm & Gezi Rehberi',
        siteUrl: 'http://localhost:5173',
        apiUrl: 'http://localhost:5000',
        domain: '',
        serverIp: '',
        sslEnabled: false,
        contactEmail: '',
        contactPhone: '',
        contactAddress: 'Fatsa, Ordu',
        socialMedia: { facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '' },
        maxUploadSizeMB: 200,
        maxImageCount: 50,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        googleAnalyticsId: '',
        maintenanceMode: false,
        maintenanceMessage: 'Site şu anda bakım modundadır. Lütfen daha sonra tekrar deneyin.',
        mapDefaultLat: 41.0442,
        mapDefaultLng: 37.4975,
        mapDefaultZoom: 13,
        chatbotEnabled: true,
        chatbotWelcomeMessage: 'Merhaba! Fatsa hakkında size nasıl yardımcı olabilirim?',
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsSection, setSettingsSection] = useState('general');

    // Modals
    const [showPlaceModal, setShowPlaceModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);

    // Confirm Delete Modal
    const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: null, title: '' });

    // Search
    const [placeSearch, setPlaceSearch] = useState('');
    const [placeFilter, setPlaceFilter] = useState('all');
    const [eventSearch, setEventSearch] = useState('');

    // Selected message
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/admin/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [placesRes, eventsRes, messagesRes, settingsRes] = await Promise.all([
                api.get('/places?limit=100'),
                api.get('/events?upcoming=false'),
                api.get('/contact').catch(() => ({ data: { data: [], unreadCount: 0 } })),
                api.get('/settings').catch(() => ({ data: { data: { maxUploadSizeMB: 200, maxImageCount: 50 } } })),
            ]);
            setPlaces(placesRes.data.data);
            setEvents(eventsRes.data.data);
            setMessages(messagesRes.data.data || []);
            if (settingsRes.data && settingsRes.data.data) {
                setSettings(settingsRes.data.data);
            }
            setUnreadCount(messagesRes.data.unreadCount || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Confirm delete
    const openDeleteModal = (type, id, title) => setDeleteModal({ show: true, type, id, title });
    const closeDeleteModal = () => setDeleteModal({ show: false, type: '', id: null, title: '' });

    const handleConfirmDelete = async () => {
        const { type, id } = deleteModal;
        try {
            if (type === 'place') {
                await api.delete(`/places/${id}`);
                setPlaces(places.filter(p => p._id !== id));
                toast.success('Yer silindi!');
            } else if (type === 'event') {
                await api.delete(`/events/${id}`);
                setEvents(events.filter(e => e._id !== id));
                toast.success('Etkinlik silindi!');
            } else if (type === 'message') {
                const msg = messages.find(m => m._id === id);
                await api.delete(`/contact/${id}`);
                setMessages(messages.filter(m => m._id !== id));
                if (msg && !msg.isRead) setUnreadCount(prev => prev - 1);
                if (selectedMessage?._id === id) setSelectedMessage(null);
                toast.success('Mesaj silindi!');
            }
        } catch (error) {
            toast.error('Silme başarısız!');
        }
        closeDeleteModal();
    };

    const handlePlaceSuccess = () => {
        setShowPlaceModal(false);
        setEditingPlace(null);
        fetchData();
    };

    const handleEventSuccess = () => {
        setShowEventModal(false);
        setEditingEvent(null);
        fetchData();
    };

    // Message actions
    const handleToggleRead = async (id) => {
        try {
            const res = await api.put(`/contact/${id}/read`);
            setMessages(messages.map(m => m._id === id ? res.data.data : m));
            setUnreadCount(prev => res.data.data.isRead ? prev - 1 : prev + 1);
        } catch (error) {
            toast.error('İşlem başarısız!');
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await api.put('/settings', settings);
            setSettings(res.data.data);
            toast.success('Ayarlar başarıyla kaydedildi!');
        } catch (error) {
            toast.error('Ayarlar kaydedilirken hata oluştu!');
        } finally {
            setSavingSettings(false);
        }
    };

    // Filters
    const filteredPlaces = places.filter(p => {
        const matchSearch = p.title.tr.toLowerCase().includes(placeSearch.toLowerCase()) ||
            p.title.en.toLowerCase().includes(placeSearch.toLowerCase());
        const matchCategory = placeFilter === 'all' || p.category === placeFilter;
        return matchSearch && matchCategory;
    });

    const filteredEvents = events.filter(e =>
        e.title.tr.toLowerCase().includes(eventSearch.toLowerCase()) ||
        e.title.en.toLowerCase().includes(eventSearch.toLowerCase())
    );

    const stats = [
        { icon: 'location_on', label: 'Toplam Yer', value: places.length, color: '#10b981', bg: '#d1fae5' },
        { icon: 'event', label: 'Etkinlikler', value: events.length, color: '#6366f1', bg: '#e0e7ff' },
        { icon: 'mail', label: 'Okunmamış', value: unreadCount, color: '#f59e0b', bg: '#fef3c7' },
        { icon: 'hotel', label: 'Oteller', value: places.filter(p => p.category === 'hotel').length, color: '#3b82f6', bg: '#dbeafe' },
    ];

    const tabs = [
        { key: 'overview', icon: 'dashboard', label: 'Dashboard' },
        { key: 'places', icon: 'location_on', label: 'Yerler' },
        { key: 'hotels', icon: 'hotel', label: 'Oteller' },
        { key: 'events', icon: 'event', label: 'Etkinlikler' },
        { key: 'messages', icon: 'mail', label: 'Mesajlar', badge: unreadCount },
        { key: 'settings', icon: 'settings', label: 'Ayarlar' },
    ];

    if (loading) {
        return (
            <div className="adm-loading">
                <div className="spinner"></div>
                <p>Dashboard yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className={`adm ${sidebarCollapsed ? 'adm--collapsed' : ''}`}>
            {/* Sidebar */}
            <aside className="adm-sidebar">
                <div className="adm-sidebar__header">
                    <div className="adm-sidebar__logo">
                        <span className="material-symbols-outlined">sailing</span>
                        {!sidebarCollapsed && <div><h2>Rota Fatsa</h2><span>Admin Panel</span></div>}
                    </div>
                    <button className="adm-sidebar__toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        <span className="material-symbols-outlined">{sidebarCollapsed ? 'menu' : 'menu_open'}</span>
                    </button>
                </div>

                <nav className="adm-sidebar__nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`adm-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="material-symbols-outlined">{tab.icon}</span>
                            {!sidebarCollapsed && <span className="adm-nav-item__label">{tab.label}</span>}
                            {tab.badge > 0 && <span className="adm-nav-item__badge">{tab.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="adm-sidebar__footer">
                    <div className="adm-user">
                        <div className="adm-user__avatar">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="adm-user__info">
                                <p>{user?.username}</p>
                                <span>{user?.role}</span>
                            </div>
                        )}
                    </div>
                    <button className="adm-logout" onClick={handleLogout}>
                        <span className="material-symbols-outlined">logout</span>
                        {!sidebarCollapsed && <span>Çıkış</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="adm-main">
                {/* Top Bar */}
                <header className="adm-topbar">
                    <div>
                        <h1>
                            {activeTab === 'overview' && 'Dashboard'}
                            {activeTab === 'places' && `Yerler (${filteredPlaces.length})`}
                            {activeTab === 'hotels' && `Oteller (${places.filter(p => p.category === 'hotel').length})`}
                            {activeTab === 'events' && `Etkinlikler (${filteredEvents.length})`}
                            {activeTab === 'messages' && `Mesajlar (${messages.length})`}
                            {activeTab === 'settings' && 'Sistem Ayarları'}
                        </h1>
                        <p>Hoş geldin, {user?.username}!</p>
                    </div>
                    <div className="adm-topbar__actions">
                        {(activeTab === 'places' || activeTab === 'hotels') && (
                            <button className="adm-btn adm-btn--primary" onClick={() => { 
                                setEditingPlace(null); 
                                setShowPlaceModal(true); 
                            }}>
                                <span className="material-symbols-outlined">add</span>
                                {activeTab === 'hotels' ? 'Yeni Otel Ekle' : 'Yeni Yer Ekle'}
                            </button>
                        )}
                        {activeTab === 'events' && (
                            <button className="adm-btn adm-btn--primary" onClick={() => { setEditingEvent(null); setShowEventModal(true); }}>
                                <span className="material-symbols-outlined">add</span>
                                Yeni Etkinlik Ekle
                            </button>
                        )}
                    </div>
                </header>

                <div className="adm-content">
                    {/* ── Overview Tab ── */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="adm-stats">
                                {stats.map((s, i) => (
                                    <div key={i} className="adm-stat-card">
                                        <div className="adm-stat-card__icon" style={{ background: s.bg, color: s.color }}>
                                            <span className="material-symbols-outlined">{s.icon}</span>
                                        </div>
                                        <div className="adm-stat-card__info">
                                            <p className="adm-stat-card__label">{s.label}</p>
                                            <h3 className="adm-stat-card__value">{s.value}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="adm-panel">
                                <div className="adm-panel__header">
                                    <h3>Hızlı İşlemler</h3>
                                </div>
                                <div className="adm-quick-actions">
                                    <button className="adm-quick-btn" onClick={() => { setEditingPlace(null); setShowPlaceModal(true); }}>
                                        <span className="material-symbols-outlined">add_location</span>
                                        Yeni Yer Ekle
                                    </button>
                                    <button className="adm-quick-btn" onClick={() => { setEditingEvent(null); setShowEventModal(true); }}>
                                        <span className="material-symbols-outlined">event</span>
                                        Yeni Etkinlik Ekle
                                    </button>
                                    <button className="adm-quick-btn" onClick={() => setActiveTab('messages')}>
                                        <span className="material-symbols-outlined">mail</span>
                                        Mesajları Gör
                                        {unreadCount > 0 && <span className="adm-quick-btn__badge">{unreadCount}</span>}
                                    </button>
                                    <button className="adm-quick-btn" onClick={() => window.open('/', '_blank')}>
                                        <span className="material-symbols-outlined">visibility</span>
                                        Siteyi Görüntüle
                                    </button>
                                </div>
                            </div>

                            {/* Recent Items */}
                            <div className="adm-grid-2">
                                <div className="adm-panel">
                                    <div className="adm-panel__header">
                                        <h3>Son Eklenen Yerler</h3>
                                    </div>
                                    <div className="adm-recent-list">
                                        {places.slice(0, 5).map(p => (
                                            <div key={p._id} className="adm-recent-item">
                                                <div className="adm-recent-item__img" style={{ backgroundImage: `url(${resolveImg(p.images?.[0])})` }}></div>
                                                <div className="adm-recent-item__info">
                                                    <h4>{p.title.tr}</h4>
                                                    <span className={`adm-badge adm-badge--${p.category}`}>{p.category}</span>
                                                </div>
                                                <span className="adm-recent-item__rating">
                                                    <span className="material-symbols-outlined">star</span>
                                                    {p.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="adm-panel">
                                    <div className="adm-panel__header">
                                        <h3>Son Mesajlar</h3>
                                    </div>
                                    <div className="adm-recent-list">
                                        {messages.slice(0, 5).map(m => (
                                            <div key={m._id} className={`adm-recent-item ${!m.isRead ? 'adm-recent-item--unread' : ''}`} onClick={() => { setSelectedMessage(m); setActiveTab('messages'); }}>
                                                <div className="adm-recent-item__mail-icon">
                                                    <span className="material-symbols-outlined">{m.isRead ? 'mail' : 'mark_email_unread'}</span>
                                                </div>
                                                <div className="adm-recent-item__info">
                                                    <h4>{m.name}</h4>
                                                    <span>{m.subject}</span>
                                                </div>
                                                <span className="adm-recent-item__time">{new Date(m.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        ))}
                                        {messages.length === 0 && <p className="adm-empty-text">Henüz mesaj yok.</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Places Tab ── */}
                    {activeTab === 'places' && (
                        <div className="adm-panel">
                            <div className="adm-toolbar">
                                <div className="adm-search-box">
                                    <span className="material-symbols-outlined">search</span>
                                    <input
                                        type="text"
                                        placeholder="Yer ara..."
                                        value={placeSearch}
                                        onChange={(e) => setPlaceSearch(e.target.value)}
                                    />
                                </div>
                                <select className="adm-filter-select" value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)}>
                                    <option value="all">Tüm Kategoriler</option>
                                    <option value="history">Tarihi</option>
                                    <option value="nature">Doğa</option>
                                    <option value="hotel">Otel</option>
                                    <option value="restaurant">Restoran</option>
                                    <option value="transport">Ulaşım</option>
                                </select>
                            </div>

                            <div className="adm-table-container">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Görsel</th>
                                            <th>Başlık</th>
                                            <th>Kategori</th>
                                            <th>Puan</th>
                                            <th>Konum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPlaces.map(place => (
                                            <tr key={place._id}>
                                                <td>
                                                    <div className="adm-table__img" style={{ backgroundImage: `url(${resolveImg(place.images?.[0])})` }}></div>
                                                </td>
                                                <td><strong>{place.title.tr}</strong></td>
                                                <td><span className={`adm-badge adm-badge--${place.category}`}>{place.category}</span></td>
                                                <td>
                                                    <span className="adm-rating">
                                                        <span className="material-symbols-outlined">star</span>
                                                        {place.rating.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td>{place.location?.address || `${place.location?.lat?.toFixed(4)}, ${place.location?.lng?.toFixed(4)}`}</td>
                                                <td>
                                                    <div className="adm-actions">
                                                        <button className="adm-action-btn adm-action-btn--edit" onClick={() => { setEditingPlace(place); setShowPlaceModal(true); }} title="Düzenle">
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button className="adm-action-btn adm-action-btn--delete" onClick={() => openDeleteModal('place', place._id, place.title.tr)} title="Sil">
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredPlaces.length === 0 && <p className="adm-empty-text">Sonuç bulunamadı.</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Hotels Tab ── */}
                    {activeTab === 'hotels' && (
                        <div className="adm-panel">
                            <div className="adm-toolbar">
                                <div className="adm-search-box">
                                    <span className="material-symbols-outlined">search</span>
                                    <input
                                        type="text"
                                        placeholder="Otel ara..."
                                        value={placeSearch}
                                        onChange={(e) => setPlaceSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="adm-table-container">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Görsel</th>
                                            <th>Otel Adı</th>
                                            <th>Puan</th>
                                            <th>Konum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {places.filter(p => 
                                            p.category === 'hotel' && 
                                            (p.title.tr.toLowerCase().includes(placeSearch.toLowerCase()) || 
                                             p.title.en.toLowerCase().includes(placeSearch.toLowerCase()))
                                        ).map(place => (
                                            <tr key={place._id}>
                                                <td>
                                                    <div className="adm-table__img" style={{ backgroundImage: `url(${resolveImg(place.images?.[0])})` }}></div>
                                                </td>
                                                <td><strong>{place.title.tr}</strong></td>
                                                <td>
                                                    <span className="adm-rating">
                                                        <span className="material-symbols-outlined">star</span>
                                                        {place.rating.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td>{place.location?.address || 'Fatsa'}</td>
                                                <td>
                                                    <div className="adm-actions">
                                                        <button className="adm-action-btn adm-action-btn--edit" onClick={() => { setEditingPlace(place); setShowPlaceModal(true); }} title="Düzenle">
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                        <button className="adm-action-btn adm-action-btn--delete" onClick={() => openDeleteModal('place', place._id, place.title.tr)} title="Sil">
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {places.filter(p => p.category === 'hotel').length === 0 && <p className="adm-empty-text">Henüz otel eklenmemiş.</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Events Tab ── */}
                    {activeTab === 'events' && (
                        <div className="adm-panel">
                            <div className="adm-toolbar">
                                <div className="adm-search-box">
                                    <span className="material-symbols-outlined">search</span>
                                    <input
                                        type="text"
                                        placeholder="Etkinlik ara..."
                                        value={eventSearch}
                                        onChange={(e) => setEventSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="adm-table-container">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Başlık</th>
                                            <th>Tarih</th>
                                            <th>Konum</th>
                                            <th>Durum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEvents.map(event => {
                                            const isPast = new Date(event.date) < new Date();
                                            return (
                                                <tr key={event._id} className={isPast ? 'adm-table__row--past' : ''}>
                                                    <td><strong>{event.title.tr}</strong></td>
                                                    <td>{new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                                    <td>{event.location}</td>
                                                    <td>
                                                        <span className={`adm-badge ${isPast ? 'adm-badge--past' : 'adm-badge--upcoming'}`}>
                                                            {isPast ? 'Geçmiş' : 'Yaklaşan'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="adm-actions">
                                                            <button className="adm-action-btn adm-action-btn--edit" onClick={() => { setEditingEvent(event); setShowEventModal(true); }} title="Düzenle">
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button className="adm-action-btn adm-action-btn--delete" onClick={() => openDeleteModal('event', event._id, event.title.tr)} title="Sil">
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {filteredEvents.length === 0 && <p className="adm-empty-text">Sonuç bulunamadı.</p>}
                            </div>
                        </div>
                    )}

                    {/* ── Messages Tab ── */}
                    {activeTab === 'messages' && (
                        <div className="adm-messages-layout">
                            {/* Message List */}
                            <div className="adm-panel adm-messages-list">
                                <div className="adm-panel__header">
                                    <h3>Gelen Kutusu</h3>
                                    <span className="adm-panel__count">{unreadCount} okunmamış</span>
                                </div>
                                <div className="adm-msg-list">
                                    {messages.map(m => (
                                        <div
                                            key={m._id}
                                            className={`adm-msg-item ${!m.isRead ? 'adm-msg-item--unread' : ''} ${selectedMessage?._id === m._id ? 'adm-msg-item--active' : ''}`}
                                            onClick={() => setSelectedMessage(m)}
                                        >
                                            <div className="adm-msg-item__indicator"></div>
                                            <div className="adm-msg-item__content">
                                                <div className="adm-msg-item__top">
                                                    <h4>{m.name}</h4>
                                                    <span>{new Date(m.createdAt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                                <p className="adm-msg-item__subject">{m.subject}</p>
                                                <p className="adm-msg-item__preview">{m.message.substring(0, 80)}...</p>
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && <p className="adm-empty-text">Henüz mesaj yok.</p>}
                                </div>
                            </div>

                            {/* Message Detail */}
                            <div className="adm-panel adm-message-detail">
                                {selectedMessage ? (
                                    <>
                                        <div className="adm-msg-detail__header">
                                            <div>
                                                <h2>{selectedMessage.subject}</h2>
                                                <p>{selectedMessage.name} • <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
                                                <span className="adm-msg-detail__date">{new Date(selectedMessage.createdAt).toLocaleString('tr-TR')}</span>
                                            </div>
                                            <div className="adm-msg-detail__actions">
                                                <button className="adm-action-btn" onClick={() => handleToggleRead(selectedMessage._id)} title={selectedMessage.isRead ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}>
                                                    <span className="material-symbols-outlined">{selectedMessage.isRead ? 'mark_email_unread' : 'mark_email_read'}</span>
                                                </button>
                                                <button className="adm-action-btn adm-action-btn--delete" onClick={() => openDeleteModal('message', selectedMessage._id, selectedMessage.subject)} title="Sil">
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="adm-msg-detail__body">
                                            <p>{selectedMessage.message}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="adm-msg-detail__empty">
                                        <span className="material-symbols-outlined">mail</span>
                                        <p>Okumak için bir mesaj seçin</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* ── Settings Tab ── */}
                    {activeTab === 'settings' && (
                        <div className="adm-settings-layout">
                            {/* Settings Sidebar Navigation */}
                            <div className="adm-settings-nav">
                                {[
                                    { key: 'general', icon: 'language', label: 'Genel Ayarlar' },
                                    { key: 'domain', icon: 'dns', label: 'Domain & IP' },
                                    { key: 'contact', icon: 'contact_mail', label: 'İletişim Bilgileri' },
                                    { key: 'social', icon: 'share', label: 'Sosyal Medya' },
                                    { key: 'upload', icon: 'cloud_upload', label: 'Yükleme Limitleri' },
                                    { key: 'seo', icon: 'search', label: 'SEO Ayarları' },
                                    { key: 'maintenance', icon: 'engineering', label: 'Bakım Modu' },
                                    { key: 'map', icon: 'map', label: 'Harita Ayarları' },
                                    { key: 'chatbot', icon: 'smart_toy', label: 'Chatbot Ayarları' },
                                ].map(sec => (
                                    <button
                                        key={sec.key}
                                        className={`adm-settings-nav__item ${settingsSection === sec.key ? 'active' : ''}`}
                                        onClick={() => setSettingsSection(sec.key)}
                                    >
                                        <span className="material-symbols-outlined">{sec.icon}</span>
                                        <span>{sec.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Settings Content */}
                            <div className="adm-settings-content">
                                <form onSubmit={handleSaveSettings}>
                                    {/* ── Genel Ayarlar ── */}
                                    {settingsSection === 'general' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">language</span>
                                                <div>
                                                    <h3>Genel Ayarlar</h3>
                                                    <p>Site adı, açıklama ve temel URL yapılandırması</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field">
                                                    <label>Site Adı</label>
                                                    <input type="text" className="adm-field__input" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} placeholder="Rota Fatsa" />
                                                    <span className="adm-field__hint">Sitenizin başlık çubuğunda ve logoda görünecek isim</span>
                                                </div>
                                                <div className="adm-field">
                                                    <label>Site Açıklaması</label>
                                                    <textarea className="adm-field__textarea" value={settings.siteDescription} onChange={(e) => setSettings({...settings, siteDescription: e.target.value})} placeholder="Fatsa Turizm & Gezi Rehberi" rows={3} />
                                                    <span className="adm-field__hint">Ana sayfada ve meta açıklamasında kullanılır</span>
                                                </div>
                                                <div className="adm-field-row">
                                                    <div className="adm-field">
                                                        <label>Site URL (Frontend)</label>
                                                        <input type="text" className="adm-field__input" value={settings.siteUrl} onChange={(e) => setSettings({...settings, siteUrl: e.target.value})} placeholder="https://rotafatsa.com" />
                                                        <span className="adm-field__hint">Ön yüz (client) erişim adresi</span>
                                                    </div>
                                                    <div className="adm-field">
                                                        <label>API URL (Backend)</label>
                                                        <input type="text" className="adm-field__input" value={settings.apiUrl} onChange={(e) => setSettings({...settings, apiUrl: e.target.value})} placeholder="https://api.rotafatsa.com" />
                                                        <span className="adm-field__hint">Backend API erişim adresi</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Domain & IP ── */}
                                    {settingsSection === 'domain' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">dns</span>
                                                <div>
                                                    <h3>Domain & IP Yapılandırması</h3>
                                                    <p>Sunucu IP adresi, domain adı ve SSL ayarları</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field">
                                                    <label>Domain Adı</label>
                                                    <input type="text" className="adm-field__input" value={settings.domain} onChange={(e) => setSettings({...settings, domain: e.target.value})} placeholder="rotafatsa.com" />
                                                    <span className="adm-field__hint">Sitenizin bağlı olduğu alan adı (örn: rotafatsa.com)</span>
                                                </div>
                                                <div className="adm-field">
                                                    <label>Sunucu IP Adresi</label>
                                                    <input type="text" className="adm-field__input" value={settings.serverIp} onChange={(e) => setSettings({...settings, serverIp: e.target.value})} placeholder="123.456.789.0" />
                                                    <span className="adm-field__hint">Sunucunun statik IP adresi</span>
                                                </div>
                                                <div className="adm-field adm-field--toggle">
                                                    <div className="adm-toggle-row">
                                                        <div>
                                                            <label>SSL Sertifikası (HTTPS)</label>
                                                            <span className="adm-field__hint">SSL aktif olduğunda site HTTPS üzerinden çalışır</span>
                                                        </div>
                                                        <button type="button" className={`adm-toggle ${settings.sslEnabled ? 'active' : ''}`} onClick={() => setSettings({...settings, sslEnabled: !settings.sslEnabled})}>
                                                            <span className="adm-toggle__dot"></span>
                                                        </button>
                                                    </div>
                                                </div>
                                                {settings.domain && settings.serverIp && (
                                                    <div className="adm-settings-info-card">
                                                        <span className="material-symbols-outlined">info</span>
                                                        <div>
                                                            <strong>Mevcut Yapılandırma:</strong>
                                                            <p>{settings.sslEnabled ? 'https' : 'http'}://{settings.domain} → {settings.serverIp}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── İletişim Bilgileri ── */}
                                    {settingsSection === 'contact' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">contact_mail</span>
                                                <div>
                                                    <h3>İletişim Bilgileri</h3>
                                                    <p>Footer ve iletişim sayfasında gösterilen bilgiler</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field">
                                                    <label>E-posta Adresi</label>
                                                    <input type="email" className="adm-field__input" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} placeholder="info@rotafatsa.com" />
                                                </div>
                                                <div className="adm-field">
                                                    <label>Telefon Numarası</label>
                                                    <input type="tel" className="adm-field__input" value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} placeholder="+90 452 XXX XX XX" />
                                                </div>
                                                <div className="adm-field">
                                                    <label>Adres</label>
                                                    <textarea className="adm-field__textarea" value={settings.contactAddress} onChange={(e) => setSettings({...settings, contactAddress: e.target.value})} placeholder="Fatsa, Ordu" rows={2} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Sosyal Medya ── */}
                                    {settingsSection === 'social' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">share</span>
                                                <div>
                                                    <h3>Sosyal Medya Hesapları</h3>
                                                    <p>Footer ve paylaşım linklerinde kullanılan profil URL'leri</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                {[
                                                    { key: 'facebook', label: 'Facebook', icon: '🔵', placeholder: 'https://facebook.com/rotafatsa' },
                                                    { key: 'instagram', label: 'Instagram', icon: '🟣', placeholder: 'https://instagram.com/rotafatsa' },
                                                    { key: 'twitter', label: 'X (Twitter)', icon: '⚫', placeholder: 'https://x.com/rotafatsa' },
                                                    { key: 'youtube', label: 'YouTube', icon: '🔴', placeholder: 'https://youtube.com/@rotafatsa' },
                                                    { key: 'tiktok', label: 'TikTok', icon: '⬛', placeholder: 'https://tiktok.com/@rotafatsa' },
                                                ].map(social => (
                                                    <div key={social.key} className="adm-field adm-field--social">
                                                        <label>
                                                            <span className="adm-field__social-icon">{social.icon}</span>
                                                            {social.label}
                                                        </label>
                                                        <input
                                                            type="url"
                                                            className="adm-field__input"
                                                            value={settings.socialMedia?.[social.key] || ''}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                socialMedia: { ...settings.socialMedia, [social.key]: e.target.value }
                                                            })}
                                                            placeholder={social.placeholder}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Yükleme Limitleri ── */}
                                    {settingsSection === 'upload' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">cloud_upload</span>
                                                <div>
                                                    <h3>Yükleme Limitleri</h3>
                                                    <p>Dosya ve fotoğraf yükleme kısıtlamaları</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field-row">
                                                    <div className="adm-field">
                                                        <label>Maksimum Dosya Boyutu (MB)</label>
                                                        <input type="number" className="adm-field__input" value={settings.maxUploadSizeMB} onChange={(e) => setSettings({...settings, maxUploadSizeMB: Number(e.target.value)})} min="1" max="1024" />
                                                        <span className="adm-field__hint">Tek dosya başına maks. boyut (Örn: 200)</span>
                                                    </div>
                                                    <div className="adm-field">
                                                        <label>Aynı Anda Maks. Dosya Sayısı</label>
                                                        <input type="number" className="adm-field__input" value={settings.maxImageCount} onChange={(e) => setSettings({...settings, maxImageCount: Number(e.target.value)})} min="1" max="100" />
                                                        <span className="adm-field__hint">Tek seferde seçilebilecek maks. fotoğraf (Örn: 50)</span>
                                                    </div>
                                                </div>
                                                <div className="adm-settings-info-card">
                                                    <span className="material-symbols-outlined">info</span>
                                                    <div>
                                                        <strong>Mevcut Ayarlar:</strong>
                                                        <p>Tek dosya boyutu: {settings.maxUploadSizeMB} MB • Toplu yükleme: {settings.maxImageCount} dosya</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── SEO Ayarları ── */}
                                    {settingsSection === 'seo' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">search</span>
                                                <div>
                                                    <h3>SEO Ayarları</h3>
                                                    <p>Arama motoru optimizasyonu ve analitik</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field">
                                                    <label>SEO Başlık (Title Tag)</label>
                                                    <input type="text" className="adm-field__input" value={settings.seoTitle} onChange={(e) => setSettings({...settings, seoTitle: e.target.value})} placeholder="Rota Fatsa - Fatsa Gezi Rehberi" />
                                                    <span className="adm-field__hint">Arama sonuçlarında görünen sayfa başlığı (60 karakter ideal)</span>
                                                </div>
                                                <div className="adm-field">
                                                    <label>SEO Açıklama (Meta Description)</label>
                                                    <textarea className="adm-field__textarea" value={settings.seoDescription} onChange={(e) => setSettings({...settings, seoDescription: e.target.value})} placeholder="Fatsa'nın en güzel yerlerini keşfedin..." rows={3} />
                                                    <span className="adm-field__hint">Arama sonuçlarında görünen kısa açıklama (155 karakter ideal)</span>
                                                </div>
                                                <div className="adm-field">
                                                    <label>Anahtar Kelimeler</label>
                                                    <input type="text" className="adm-field__input" value={settings.seoKeywords} onChange={(e) => setSettings({...settings, seoKeywords: e.target.value})} placeholder="fatsa, turizm, gezi, ordu, karadeniz" />
                                                    <span className="adm-field__hint">Virgülle ayrılmış anahtar kelimeler</span>
                                                </div>
                                                <div className="adm-field">
                                                    <label>Google Analytics ID</label>
                                                    <input type="text" className="adm-field__input" value={settings.googleAnalyticsId} onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})} placeholder="G-XXXXXXXXXX" />
                                                    <span className="adm-field__hint">Google Analytics ölçüm kimliği (G- ile başlayan)</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Bakım Modu ── */}
                                    {settingsSection === 'maintenance' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">engineering</span>
                                                <div>
                                                    <h3>Bakım Modu</h3>
                                                    <p>Siteyi geçici olarak bakım moduna alma</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field adm-field--toggle">
                                                    <div className="adm-toggle-row">
                                                        <div>
                                                            <label>Bakım Modunu Etkinleştir</label>
                                                            <span className="adm-field__hint">Aktif olduğunda ziyaretçiler bakım sayfasını görür</span>
                                                        </div>
                                                        <button type="button" className={`adm-toggle ${settings.maintenanceMode ? 'active' : ''}`} onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}>
                                                            <span className="adm-toggle__dot"></span>
                                                        </button>
                                                    </div>
                                                </div>
                                                {settings.maintenanceMode && (
                                                    <div className="adm-settings-warning-card">
                                                        <span className="material-symbols-outlined">warning</span>
                                                        <span>Bakım modu aktif! Ziyaretçiler siteye erişemez.</span>
                                                    </div>
                                                )}
                                                <div className="adm-field">
                                                    <label>Bakım Mesajı</label>
                                                    <textarea className="adm-field__textarea" value={settings.maintenanceMessage} onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})} rows={3} />
                                                    <span className="adm-field__hint">Ziyaretçilere gösterilecek bakım mesajı</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Harita Ayarları ── */}
                                    {settingsSection === 'map' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">map</span>
                                                <div>
                                                    <h3>Harita Ayarları</h3>
                                                    <p>Varsayılan harita merkezi ve yakınlaştırma seviyesi</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field-row adm-field-row--3">
                                                    <div className="adm-field">
                                                        <label>Enlem (Latitude)</label>
                                                        <input type="number" step="0.0001" className="adm-field__input" value={settings.mapDefaultLat} onChange={(e) => setSettings({...settings, mapDefaultLat: Number(e.target.value)})} />
                                                    </div>
                                                    <div className="adm-field">
                                                        <label>Boylam (Longitude)</label>
                                                        <input type="number" step="0.0001" className="adm-field__input" value={settings.mapDefaultLng} onChange={(e) => setSettings({...settings, mapDefaultLng: Number(e.target.value)})} />
                                                    </div>
                                                    <div className="adm-field">
                                                        <label>Yakınlaştırma (Zoom)</label>
                                                        <input type="number" min="1" max="20" className="adm-field__input" value={settings.mapDefaultZoom} onChange={(e) => setSettings({...settings, mapDefaultZoom: Number(e.target.value)})} />
                                                    </div>
                                                </div>
                                                <div className="adm-settings-info-card">
                                                    <span className="material-symbols-outlined">my_location</span>
                                                    <div>
                                                        <strong>Varsayılan Konum:</strong>
                                                        <p>Lat: {settings.mapDefaultLat} | Lng: {settings.mapDefaultLng} | Zoom: {settings.mapDefaultZoom}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Chatbot Ayarları ── */}
                                    {settingsSection === 'chatbot' && (
                                        <div className="adm-settings-section">
                                            <div className="adm-settings-section__header">
                                                <span className="material-symbols-outlined">smart_toy</span>
                                                <div>
                                                    <h3>Chatbot Ayarları</h3>
                                                    <p>Yapay zeka asistan yapılandırması</p>
                                                </div>
                                            </div>
                                            <div className="adm-settings-fields">
                                                <div className="adm-field adm-field--toggle">
                                                    <div className="adm-toggle-row">
                                                        <div>
                                                            <label>Chatbot'u Etkinleştir</label>
                                                            <span className="adm-field__hint">Devre dışı bırakıldığında chatbot ikonu görünmez</span>
                                                        </div>
                                                        <button type="button" className={`adm-toggle ${settings.chatbotEnabled ? 'active' : ''}`} onClick={() => setSettings({...settings, chatbotEnabled: !settings.chatbotEnabled})}>
                                                            <span className="adm-toggle__dot"></span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="adm-field">
                                                    <label>Karşılama Mesajı</label>
                                                    <textarea className="adm-field__textarea" value={settings.chatbotWelcomeMessage} onChange={(e) => setSettings({...settings, chatbotWelcomeMessage: e.target.value})} rows={2} />
                                                    <span className="adm-field__hint">Chatbot açıldığında gösterilen ilk mesaj</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Save Button */}
                                    <div className="adm-settings-footer">
                                        <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg" disabled={savingSettings}>
                                            <span className="material-symbols-outlined">{savingSettings ? 'hourglass_empty' : 'save'}</span>
                                            {savingSettings ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <PlaceFormModal
                    show={showPlaceModal}
                    onClose={() => { setShowPlaceModal(false); setEditingPlace(null); }}
                    place={editingPlace}
                    onSuccess={handlePlaceSuccess}
                />
                <EventFormModal
                    show={showEventModal}
                    onClose={() => { setShowEventModal(false); setEditingEvent(null); }}

                    event={editingEvent}
                    onSuccess={handleEventSuccess}
                />

                {/* Delete Confirm Modal */}
                {deleteModal.show && (
                    <div className="adm-modal-overlay" onClick={closeDeleteModal}>
                        <div className="adm-confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="adm-confirm-modal__icon">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <h3>Silmek istediğinize emin misiniz?</h3>
                            <p><strong>"{deleteModal.title}"</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
                            <div className="adm-confirm-modal__actions">
                                <button className="adm-modal-btn adm-modal-btn--secondary" onClick={closeDeleteModal}>İptal</button>
                                <button className="adm-modal-btn adm-modal-btn--danger" onClick={handleConfirmDelete}>
                                    <span className="material-symbols-outlined">delete</span> Sil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
