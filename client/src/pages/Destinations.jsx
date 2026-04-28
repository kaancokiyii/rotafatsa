import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './Destinations.css';

function Destinations() {
    const { language } = useLanguage();
    const [searchParams] = useSearchParams();
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => { fetchPlaces(); }, []);

    useEffect(() => {
        let filtered = [...places];
        if (selectedCategory !== 'all') filtered = filtered.filter(p => p.category === selectedCategory);
        if (searchTerm) filtered = filtered.filter(p => p.title[language].toLowerCase().includes(searchTerm.toLowerCase()));
        filtered.sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : a.title[language].localeCompare(b.title[language]));
        setFilteredPlaces(filtered);
    }, [places, selectedCategory, searchTerm, sortBy, language]);

    const fetchPlaces = async () => {
        try {
            const response = await api.get('/places?limit=100');
            setPlaces(response.data.data);
        } catch (error) {
            console.error('Error fetching places:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { value: 'all', label: { tr: 'Tümü', en: 'All' }, icon: 'grid_view' },
        { value: 'history', label: { tr: 'Tarihi', en: 'Historical' }, icon: 'history_edu', color: '#f59e0b' },
        { value: 'nature', label: { tr: 'Doğa', en: 'Nature' }, icon: 'forest', color: '#10b981' },
        { value: 'hotel', label: { tr: 'Konaklama', en: 'Hotels' }, icon: 'hotel', color: '#3b82f6' },
        { value: 'restaurant', label: { tr: 'Yemek', en: 'Dining' }, icon: 'restaurant', color: '#f97316' },
    ];

    if (loading) {
        return <LoadingSpinner fullScreen message={language === 'tr' ? 'Yerler yükleniyor...' : 'Loading places...'} />;
    }

    return (
        <div className="dst-page">
            <Navbar />

            {/* Header */}
            <section className="dst-header">
                <div className="dst-container">
                    <h1>{language === 'tr' ? 'Keşfedilecek Yerler' : 'Places to Explore'}</h1>
                    <p>{language === 'tr'
                        ? "Fatsa'nın tarihi, doğal ve kültürel güzelliklerini keşfedin."
                        : 'Discover the historical, natural, and cultural beauties of Fatsa.'}</p>
                </div>
            </section>

            {/* Filters */}
            <section className="dst-filters">
                <div className="dst-container">
                    <div className="dst-filters__bar">
                        {/* Search */}
                        <div className="dst-search">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder={language === 'tr' ? 'Yer ara...' : 'Search places...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Sort */}
                        <select className="dst-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="name">{language === 'tr' ? 'İsim' : 'Name'}</option>
                            <option value="rating">{language === 'tr' ? 'Puan' : 'Rating'}</option>
                        </select>
                    </div>

                    {/* Category Pills */}
                    <div className="dst-categories">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                className={`dst-cat-btn ${selectedCategory === cat.value ? 'dst-cat-btn--active' : ''}`}
                                onClick={() => setSelectedCategory(cat.value)}
                            >
                                <span className="material-symbols-outlined">{cat.icon}</span>
                                {cat.label[language] || cat.label.en}
                            </button>
                        ))}
                    </div>

                    <p className="dst-result-count">
                        {filteredPlaces.length} {language === 'tr' ? 'sonuç bulundu' : 'results found'}
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="dst-grid-section">
                <div className="dst-container">
                    {filteredPlaces.length === 0 ? (
                        <div className="dst-empty">
                            <span className="material-symbols-outlined">search_off</span>
                            <p>{language === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}</p>
                        </div>
                    ) : (
                        <div className="dst-grid">
                            {filteredPlaces.map(place => {
                                const cat = categories.find(c => c.value === place.category);
                                return (
                                    <Link to={`/place/${place._id}`} key={place._id} className="dst-card">
                                        <div className="dst-card__img">
                                            <div
                                                className="dst-card__img-bg"
                                                style={{ backgroundImage: place.images?.[0] ? `url(${resolveImg(place.images[0])})` : 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600)' }}
                                            ></div>
                                            <span className="dst-card__badge" style={{ background: cat?.color || '#6b7280' }}>
                                                <span className="material-symbols-outlined">{cat?.icon || 'place'}</span>
                                                {cat?.label[language] || place.category}
                                            </span>
                                            <div className="dst-card__rating">
                                                <span className="material-symbols-outlined">star</span>
                                                {place.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="dst-card__body">
                                            <h3>{place.title[language]}</h3>
                                            <p>{place.description[language].substring(0, 100)}...</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Destinations;
