import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './HomePage.css';
import heroImage from './DJI_0652.jpg';

function HomePage() {
    const [places, setPlaces] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [heroLoaded, setHeroLoaded] = useState(false);
    const { language } = useLanguage();
    const t = translations[language];
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const timer = setTimeout(() => setHeroLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const fetchData = async () => {
        try {
            const [placesRes, eventsRes] = await Promise.all([
                api.get('/places?limit=6'),
                api.get('/events'),
            ]);
            setPlaces(placesRes.data.data);
            setEvents(eventsRes.data.data.slice(0, 3));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (searchDate) params.set('date', searchDate);
        navigate(`/destinations${params.toString() ? '?' + params.toString() : ''}`);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const getCategoryLabel = (category) => {
        const labels = {
            history: { icon: 'history_edu', color: '#f59e0b', label: t.categories?.history || 'Tarih' },
            nature: { icon: 'forest', color: '#10b981', label: t.categories?.nature || 'Doğa' },
            hotel: { icon: 'hotel', color: '#3b82f6', label: t.categories?.hotel || 'Hotel' },
            restaurant: { icon: 'restaurant', color: '#f97316', label: t.categories?.restaurant || 'Restoran' },
            transport: { icon: 'directions', color: '#a855f7', label: t.categories?.transport || 'Ulaşım' },
        };
        return labels[category] || { icon: 'place', color: '#6b7280', label: category };
    };

    // Blog entries (static for now — can be dynamic later)
    const blogPosts = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600',
            title: { tr: "Fatsa'da Keşfedilmesi Gereken 5 Gizli Cennet", en: '5 Hidden Paradises to Discover in Fatsa' },
            excerpt: { tr: 'Karadeniz kıyısında saklı kalmış bozulmamış doğanın en güzel örneklerini keşfedin.', en: 'Discover the finest examples of untouched nature hidden along the Black Sea coast.' },
            category: { tr: 'Gezi Rehberi', en: 'Travel Guide' },
            date: '2026-02-15',
            readTime: '5 dk',
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
            title: { tr: 'Fatsa Mutfağı: Karadeniz Lezzetleri', en: 'Fatsa Cuisine: Black Sea Flavors' },
            excerpt: { tr: 'Hamsi, kuymak ve mısır ekmeği gibi yöresel tatları keşfedin.', en: 'Explore local flavors like anchovies, kuymak, and corn bread.' },
            category: { tr: 'Gastronomi', en: 'Gastronomy' },
            date: '2026-02-10',
            readTime: '4 dk',
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
            title: { tr: 'Bolaman Kalesi: Tarihin İzleri', en: 'Bolaman Castle: Traces of History' },
            excerpt: { tr: 'Yüzyıllık tarihi kalede bir yolculuğa çıkın.', en: 'Take a journey in this centuries-old historical castle.' },
            category: { tr: 'Tarih', en: 'History' },
            date: '2026-02-05',
            readTime: '6 dk',
        },
    ];

    // Explore categories
    const exploreItems = [
        { icon: 'forest', title: { tr: 'Doğa', en: 'Nature' }, desc: { tr: 'Ormanlar, göller ve sahiller', en: 'Forests, lakes & beaches' }, color: '#10b981', to: '/destinations?category=nature' },
        { icon: 'history_edu', title: { tr: 'Tarih', en: 'History' }, desc: { tr: 'Kaleler ve tarihi eserler', en: 'Castles & historical artifacts' }, color: '#f59e0b', to: '/destinations?category=history' },
        { icon: 'restaurant', title: { tr: 'Gastronomi', en: 'Gastronomy' }, desc: { tr: 'Yerel lezzetler', en: 'Local flavors' }, color: '#f97316', to: '/destinations?category=restaurant' },
        { icon: 'hotel', title: { tr: 'Konaklama', en: 'Accommodation' }, desc: { tr: 'Oteller ve pansiyonlar', en: 'Hotels & guesthouses' }, color: '#3b82f6', to: '/hotels' },
        { icon: 'event', title: { tr: 'Etkinlikler', en: 'Events' }, desc: { tr: 'Festival ve etkinlikler', en: 'Festivals & events' }, color: '#8b5cf6', to: '/events' },
        { icon: 'map', title: { tr: 'Harita', en: 'Map' }, desc: { tr: "Fatsa'yı keşfet", en: 'Explore Fatsa' }, color: '#06b6d4', to: '/map' },
    ];

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
            </div>
        );
    }

    return (
        <div className="hp">
            <Navbar />

            {/* ── Hero Section ── */}
            <section className={`hp-hero ${heroLoaded ? 'hp-hero--loaded' : ''}`}>
                <div className="hp-hero__bg" style={{ backgroundImage: `url(${heroImage})` }}></div>
                <div className="hp-hero__overlay"></div>

                <div className="hp-hero__content">
                    <span className="hp-hero__badge">
                        <span className="material-symbols-outlined">travel_explore</span>
                        {language === 'tr' ? 'RESMİ TURİZM REHBERİ' : 'OFFICIAL TOURISM GUIDE'}
                    </span>

                    <h1 className="hp-hero__title">
                        {language === 'tr' ? (
                            <>Karadeniz'in Saklı<br />Cevherini <span className="hp-accent">Keşfedin</span></>
                        ) : (
                            <>Discover the Hidden Gem<br />of the <span className="hp-accent">Black Sea</span></>
                        )}
                    </h1>

                    <p className="hp-hero__subtitle">
                        {language === 'tr'
                            ? "Bozulmamış doğası, zengin tarihi ve canlı kültürüyle Fatsa'yı deneyimleyin."
                            : "Experience pristine nature, rich history, and vibrant culture in Fatsa."}
                    </p>

                    {/* Search Bar */}
                    <div className="hp-search">
                        <div className="hp-search__field">
                            <span className="material-symbols-outlined">search</span>
                            <div className="hp-search__input-wrap">
                                <label>{language === 'tr' ? 'NEREYE?' : 'WHERE TO?'}</label>
                                <input
                                    type="text"
                                    placeholder={language === 'tr' ? 'Destinasyon, restoran ara...' : 'Search destinations, restaurants...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>
                        </div>

                        <div className="hp-search__divider"></div>

                        <div className="hp-search__field">
                            <span className="material-symbols-outlined">calendar_month</span>
                            <div className="hp-search__input-wrap">
                                <label>{language === 'tr' ? 'NE ZAMAN?' : 'WHEN?'}</label>
                                <input
                                    type="text"
                                    placeholder={language === 'tr' ? 'Tarih ekle' : 'Add dates'}
                                    value={searchDate}
                                    onFocus={(e) => (e.target.type = 'date')}
                                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="hp-search__btn" onClick={handleSearch}>
                            <span className="material-symbols-outlined">search</span>
                            <span>{language === 'tr' ? 'Ara' : 'Search'}</span>
                        </button>
                    </div>

                    {/* Quick Stats under search */}
                    <div className="hp-hero__stats">
                        <div className="hp-hero__stat">
                            <span className="material-symbols-outlined">place</span>
                            <span>{places.length}+ {language === 'tr' ? 'Destinasyon' : 'Destinations'}</span>
                        </div>
                        <div className="hp-hero__stat">
                            <span className="material-symbols-outlined">event</span>
                            <span>{events.length} {language === 'tr' ? 'Etkinlik' : 'Events'}</span>
                        </div>
                        <div className="hp-hero__stat">
                            <span className="material-symbols-outlined">star</span>
                            <span>4.8 {language === 'tr' ? 'Ortalama Puan' : 'Avg Rating'}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Explore Categories ── */}
            <section className="hp-explore">
                <div className="hp-container">
                    <div className="hp-section-header">
                        <div>
                            <h2>{language === 'tr' ? "Fatsa'yı Keşfedin" : 'Explore Fatsa'}</h2>
                            <p>{language === 'tr' ? 'Kategorilere göre gezin' : 'Browse by category'}</p>
                        </div>
                    </div>
                    <div className="hp-explore-grid">
                        {exploreItems.map((item, i) => (
                            <Link key={i} to={item.to} className="hp-explore-card">
                                <div className="hp-explore-card__icon" style={{ background: item.color + '1a', color: item.color }}>
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <h3>{item.title[language]}</h3>
                                <p>{item.desc[language]}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Top Destinations ── */}
            <section className="hp-destinations">
                <div className="hp-container">
                    <div className="hp-section-header">
                        <div>
                            <h2>{language === 'tr' ? 'Popüler Destinasyonlar' : 'Top Destinations'}</h2>
                            <p>{language === 'tr' ? "Fatsa'da kaçırmamanız gereken yerler." : "Curated spots you can't miss in Fatsa."}</p>
                        </div>
                        <Link to="/destinations" className="hp-view-all">
                            {language === 'tr' ? 'Tümünü gör' : 'View all places'}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="hp-dest-grid">
                        {places.slice(0, 3).map((place) => {
                            const cat = getCategoryLabel(place.category);
                            return (
                                <Link to={`/place/${place._id}`} key={place._id} className="hp-dest-card">
                                    <div className="hp-dest-card__img">
                                        <div
                                            className="hp-dest-card__img-bg"
                                            style={{
                                                backgroundImage: place.images?.[0]
                                                    ? `url(${resolveImg(place.images[0])})`
                                                    : 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600)'
                                            }}
                                        ></div>
                                        <span className="hp-dest-card__badge" style={{ background: cat.color }}>
                                            <span className="material-symbols-outlined">{cat.icon}</span>
                                            {cat.label}
                                        </span>
                                    </div>
                                    <div className="hp-dest-card__body">
                                        <div className="hp-dest-card__top">
                                            <h3>{place.title[language]}</h3>
                                            <span className="hp-dest-card__rating">
                                                <span className="material-symbols-outlined">star</span>
                                                {place.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="hp-dest-card__desc">
                                            {place.description[language].length > 120
                                                ? place.description[language].substring(0, 120) + '...'
                                                : place.description[language]}
                                        </p>
                                        <button className="hp-dest-card__btn">
                                            {t.buttons?.viewDetails || (language === 'tr' ? 'Detayları Gör' : 'View Details')}
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Upcoming Events ── */}
            {events.length > 0 && (
                <section className="hp-events">
                    <div className="hp-container">
                        <div className="hp-section-header hp-section-header--events">
                            <div>
                                <h2>{language === 'tr' ? 'Yaklaşan Etkinlikler' : 'Upcoming Events'}</h2>
                            </div>
                            <Link to="/events" className="hp-view-all">
                                {language === 'tr' ? 'Tüm etkinlikler' : 'All events'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="hp-events-grid">
                            {events.map((event) => {
                                const d = new Date(event.date);
                                const monthNames = {
                                    tr: ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'],
                                    en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
                                };
                                const month = (monthNames[language] || monthNames.en)[d.getMonth()];
                                const day = d.getDate().toString().padStart(2, '0');
                                const time = d.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <Link to="/events" key={event._id} className="hp-event-card">
                                        <div className="hp-event-card__date">
                                            <span className="hp-event-card__month">{month}</span>
                                            <span className="hp-event-card__day">{day}</span>
                                        </div>
                                        <div className="hp-event-card__info">
                                            <h4>{event.title[language]}</h4>
                                            <p>
                                                <span className="material-symbols-outlined">location_on</span>
                                                {event.location} • {time}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Blog / Guide Section ── */}
            <section className="hp-blog">
                <div className="hp-container">
                    <div className="hp-section-header">
                        <div>
                            <h2>{language === 'tr' ? 'Blog & Rehberler' : 'Blog & Guides'}</h2>
                            <p>{language === 'tr' ? "Fatsa hakkında yazılar, gezi tavsiyeleri ve daha fazlası." : 'Articles, travel tips, and more about Fatsa.'}</p>
                        </div>
                    </div>
                    <div className="hp-blog-grid">
                        {blogPosts.map(post => (
                            <div key={post.id} className="hp-blog-card" onClick={() => {
                                import('react-hot-toast').then(({ toast }) => {
                                    toast(language === 'tr' ? 'Blog sistemi yakında!' : 'Blog system coming soon!', { icon: '🚧' });
                                });
                            }}>
                                <div className="hp-blog-card__img" style={{ backgroundImage: `url(${post.image})` }}>
                                    <span className="hp-blog-card__cat">{post.category[language]}</span>
                                </div>
                                <div className="hp-blog-card__body">
                                    <span className="hp-blog-card__meta">
                                        <span className="material-symbols-outlined">calendar_month</span>
                                        {new Date(post.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long' })}
                                        <span className="hp-blog-card__dot">•</span>
                                        <span className="material-symbols-outlined">schedule</span>
                                        {post.readTime}
                                    </span>
                                    <h3>{post.title[language]}</h3>
                                    <p>{post.excerpt[language]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="hp-cta">
                <div className="hp-container">
                    <div className="hp-cta__content">
                        <span className="material-symbols-outlined hp-cta__icon">explore</span>
                        <h2>{language === 'tr' ? "Fatsa'yı Keşfetmeye Hazır mısınız?" : 'Ready to Explore Fatsa?'}</h2>
                        <p>{language === 'tr'
                            ? 'Haritadan tüm turistik noktaları inceleyin veya yapay zeka asistanımızla konuşun.'
                            : 'Browse all tourist spots on the map or chat with our AI assistant.'}</p>
                        <div className="hp-cta__buttons">
                            <Link to="/map" className="hp-cta__btn hp-cta__btn--primary">
                                <span className="material-symbols-outlined">map</span>
                                {language === 'tr' ? 'Haritayı Aç' : 'Open Map'}
                            </Link>
                            <Link to="/destinations" className="hp-cta__btn hp-cta__btn--outline">
                                <span className="material-symbols-outlined">location_on</span>
                                {language === 'tr' ? 'Tüm Yerler' : 'All Places'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>



            <Footer />
        </div>
    );
}

export default HomePage;
