import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './PlaceDetails.css';

function PlaceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [relatedPlaces, setRelatedPlaces] = useState([]);

    useEffect(() => {
        fetchPlaceDetails();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchPlaceDetails = async () => {
        try {
            const response = await api.get(`/places/${id}`);
            setPlace(response.data.data);

            // Fetch related places (same category)
            const relatedRes = await api.get(`/places?category=${response.data.data.category}&limit=3`);
            setRelatedPlaces(relatedRes.data.data.filter(p => p._id !== id));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching place:', error);
            setLoading(false);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
    };

    const getCategoryIcon = (category) => {
        const icons = {
            history: 'history_edu',
            nature: 'forest',
            hotel: 'hotel',
            restaurant: 'restaurant',
            transport: 'directions',
        };
        return icons[category] || 'place';
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="error-page">
                <Navbar />
                <div className="error-content">
                    <h1>{language === 'tr' ? 'Yer Bulunamadı' : 'Place Not Found'}</h1>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        {language === 'tr' ? 'Ana Sayfaya Dön' : 'Go Home'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="place-details-page">
            <Navbar />

            {/* Hero Image Carousel */}
            <section className="place-hero">
                <div className="image-carousel">
                    {place.images && place.images.length > 0 ? (
                        <>
                            <div
                                className="carousel-image"
                                style={{ backgroundImage: `url(${resolveImg(place.images[currentImageIndex])})` }}
                            />
                            {place.images.length > 1 && (
                                <>
                                    <button className="carousel-btn prev" onClick={prevImage}>
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button className="carousel-btn next" onClick={nextImage}>
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                    <div className="carousel-indicators">
                                        {place.images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="carousel-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200)' }} />
                    )}
                </div>

                <button className="back-btn" onClick={() => navigate(-1)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    {language === 'tr' ? 'Geri' : 'Back'}
                </button>
            </section>

            <div className="container">
                <div className="place-details-content">
                    {/* Main Content */}
                    <div className="details-main">
                        {/* Header */}
                        <div className="details-header">
                            <div>
                                <div className="category-badge">
                                    <span className="material-symbols-outlined">{getCategoryIcon(place.category)}</span>
                                    {t.categories[place.category]}
                                </div>
                                <h1>{place.title[language]}</h1>
                                <div className="meta-info">
                                    <div className="rating-large">
                                        <span className="material-symbols-outlined filled">star</span>
                                        <span className="rating-value">{place.rating.toFixed(1)}</span>
                                        <span className="rating-text">
                                            ({place.rating >= 4.5 ? (language === 'tr' ? 'Mükemmel' : 'Excellent') : 
                                              place.rating >= 4.0 ? (language === 'tr' ? 'Çok İyi' : 'Very Good') : 
                                              place.rating >= 3.0 ? (language === 'tr' ? 'İyi' : 'Good') : 
                                              (language === 'tr' ? 'Orta' : 'Average')})
                                        </span>
                                    </div>
                                    <div className="location-info">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <span>{place.location.address || 'Fatsa, Ordu'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="details-section">
                            <h2>{language === 'tr' ? 'Hakkında' : 'About'}</h2>
                            <p className="description-text">{place.description[language]}</p>
                        </div>



                        {/* Map */}
                        <div className="details-section">
                            <h2>{language === 'tr' ? 'Konum' : 'Location'}</h2>
                            <div className="map-container">
                                {place.location?.lat && place.location?.lng ? (
                                    <iframe
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.location.lng - 0.01},${place.location.lat - 0.01},${place.location.lng + 0.01},${place.location.lat + 0.01}&layer=mapnik&marker=${place.location.lat},${place.location.lng}`}
                                        style={{ width: '100%', height: '400px', border: 'none', borderRadius: '0.75rem' }}
                                        title={place.title[language]}
                                    />
                                ) : (
                                    <div className="map-placeholder">
                                        <span className="material-symbols-outlined">location_off</span>
                                        <p>{language === 'tr' ? 'Konum bilgisi mevcut değil' : 'Location not available'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="details-sidebar">
                        {/* Contact Card */}
                        <div className="sidebar-card">
                            <h3>{language === 'tr' ? 'İletişim Bilgileri' : 'Contact Information'}</h3>
                            {place.contact?.phone && (
                                <div className="contact-item">
                                    <span className="material-symbols-outlined">call</span>
                                    <div>
                                        <p className="label">{language === 'tr' ? 'Telefon' : 'Phone'}</p>
                                        <a href={`tel:${place.contact.phone}`}>{place.contact.phone}</a>
                                    </div>
                                </div>
                            )}
                            {place.contact?.email && (
                                <div className="contact-item">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div>
                                        <p className="label">{language === 'tr' ? 'E-posta' : 'Email'}</p>
                                        <a href={`mailto:${place.contact.email}`}>{place.contact.email}</a>
                                    </div>
                                </div>
                            )}
                            {place.contact?.website && (
                                <div className="contact-item">
                                    <span className="material-symbols-outlined">language</span>
                                    <div>
                                        <p className="label">{language === 'tr' ? 'Website' : 'Website'}</p>
                                        <a href={place.contact.website} target="_blank" rel="noopener noreferrer">
                                            {language === 'tr' ? 'Ziyaret Et' : 'Visit Website'}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Share Card */}
                        <div className="sidebar-card">
                            <h3>{language === 'tr' ? 'Paylaş' : 'Share'}</h3>
                            <div className="share-buttons">
                                <a href={`https://wa.me/?text=${encodeURIComponent(place.title[language] + ' - ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="share-btn whatsapp">
                                    <span>WhatsApp</span>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="share-btn facebook">
                                    <span>Facebook</span>
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(place.title[language])}`} target="_blank" rel="noopener noreferrer" className="share-btn twitter">
                                    <span>Twitter</span>
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related Places */}
                {relatedPlaces.length > 0 && (
                    <section className="related-places">
                        <h2>{language === 'tr' ? 'Benzer Yerler' : 'Similar Places'}</h2>
                        <div className="related-grid">
                            {relatedPlaces.map((relatedPlace) => (
                                <div
                                    key={relatedPlace._id}
                                    className="related-card"
                                    onClick={() => navigate(`/place/${relatedPlace._id}`)}
                                >
                                    <div
                                        className="related-image"
                                        style={{ backgroundImage: `url(${relatedPlace.images[0] ? resolveImg(relatedPlace.images[0]) : 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400'})` }}
                                    />
                                    <div className="related-content">
                                        <h3>{relatedPlace.title[language]}</h3>
                                        <div className="related-rating">
                                            <span className="material-symbols-outlined">star</span>
                                            {relatedPlace.rating.toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default PlaceDetails;
