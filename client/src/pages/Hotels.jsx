import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './Hotels.css';

function Hotels() {
    const { language } = useLanguage();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchHotels(); }, []);

    const fetchHotels = async () => {
        try {
            const response = await api.get('/places?limit=100');
            setHotels(response.data.data.filter(p => p.category === 'hotel'));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={language === 'tr' ? 'Oteller yükleniyor...' : 'Loading hotels...'} />;
    }

    return (
        <div className="htl-page">
            <Navbar />

            {/* Header */}
            <section className="htl-header">
                <div className="htl-container">
                    <span className="htl-header__badge">
                        <span className="material-symbols-outlined">hotel</span>
                        {language === 'tr' ? 'KONAKLAMA' : 'ACCOMMODATION'}
                    </span>
                    <h1>{language === 'tr' ? 'Nerede Kalınır?' : 'Where to Stay?'}</h1>
                    <p>{language === 'tr'
                        ? "Fatsa'nın en konforlu ve eşsiz manzaralı otellerini, pansiyonlarını keşfedin."
                        : 'Discover the most comfortable and scenic hotels and guesthouses in Fatsa.'}</p>
                </div>
            </section>

            {/* Stats */}
            <section className="htl-stats-section">
                <div className="htl-container">
                    <div className="htl-stats">
                        <div className="htl-stat">
                            <span className="material-symbols-outlined">hotel</span>
                            <div>
                                <h3>{hotels.length}</h3>
                                <p>{language === 'tr' ? 'Konaklama' : 'Properties'}</p>
                            </div>
                        </div>
                        <div className="htl-stat">
                            <span className="material-symbols-outlined">star</span>
                            <div>
                                <h3>{hotels.length > 0 ? (hotels.reduce((a, h) => a + h.rating, 0) / hotels.length).toFixed(1) : '0'}</h3>
                                <p>{language === 'tr' ? 'Ort. Puan' : 'Avg. Rating'}</p>
                            </div>
                        </div>
                        <div className="htl-stat">
                            <span className="material-symbols-outlined">wifi</span>
                            <div>
                                <h3>{hotels.length > 0 ? '100%' : '0%'}</h3>
                                <p>{language === 'tr' ? 'Ücretsiz WiFi' : 'Free WiFi'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hotels Grid */}
            <section className="htl-grid-section">
                <div className="htl-container">
                    <div className="htl-section-title">
                        <h2>{language === 'tr' ? 'Tüm Konaklama Seçenekleri' : 'All Accommodation Options'}</h2>
                    </div>

                    {hotels.length === 0 ? (
                        <div className="htl-empty">
                            <span className="material-symbols-outlined">hotel</span>
                            <h3>{language === 'tr' ? 'Henüz otel eklenmemiş' : 'No hotels added yet'}</h3>
                            <p>{language === 'tr' ? 'Yakında Fatsa\'nın en güzel otelleri burada listelenecek.' : 'The best hotels will be listed here soon.'}</p>
                        </div>
                    ) : (
                        <div className="htl-grid">
                            {hotels.map(hotel => (
                                <Link to={`/place/${hotel._id}`} key={hotel._id} className="htl-card">
                                    <div className="htl-card__img">
                                        <div className="htl-card__img-bg" style={{
                                            backgroundImage: hotel.images?.[0]
                                                ? `url(${resolveImg(hotel.images[0])})`
                                                : 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800)'
                                        }}></div>
                                        <div className="htl-card__rating">
                                            <span className="material-symbols-outlined">star</span>
                                            {hotel.rating.toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="htl-card__body">
                                        <h3>{hotel.title[language]}</h3>
                                        <p className="htl-card__desc">{hotel.description[language].substring(0, 100)}...</p>

                                        <div className="htl-card__action">
                                            <span>{language === 'tr' ? 'Detayları Gör' : 'View Details'}</span>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Hotels;
