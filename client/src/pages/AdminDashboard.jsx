import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import PlaceFormModal from '../components/PlaceFormModal';
import EventFormModal from '../components/EventFormModal';
import './AdminDashboard.css';

// Resolve image URLs (supports /uploads/ paths and full URLs)
const resolveImg = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200';
    if (src.startsWith('http')) return src;
    if (src.startsWith('/uploads/')) return `http://localhost:5000${src}`;
    return src;
};

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
            const [placesRes, eventsRes, messagesRes] = await Promise.all([
                api.get('/places?limit=100'),
                api.get('/events?upcoming=false'),
                api.get('/contact').catch(() => ({ data: { data: [], unreadCount: 0 } })),
            ]);
            setPlaces(placesRes.data.data);
            setEvents(eventsRes.data.data);
            setMessages(messagesRes.data.data || []);
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
