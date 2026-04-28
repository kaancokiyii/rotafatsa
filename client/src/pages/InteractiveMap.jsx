import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './InteractiveMap.css';

function InteractiveMap() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const { language } = useLanguage();
    const t = translations[language];

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);

    // Fatsa default center coordinates
    const fatsaCenter = [41.0289, 37.4992];
    const defaultZoom = 13;

    useEffect(() => {
        fetchPlaces();
    }, []);

    // Initialize Leaflet map once
    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: fatsaCenter,
                zoom: defaultZoom,
                zoomControl: true,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);

            markersLayerRef.current = L.layerGroup().addTo(map);
            mapInstanceRef.current = map;

            // Fix map size after render (multiple attempts for reliability)
            setTimeout(() => map.invalidateSize(), 100);
            setTimeout(() => map.invalidateSize(), 500);
            setTimeout(() => map.invalidateSize(), 1500);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [loading]); // re-run when loading finishes so the div is in the DOM

    const fetchPlaces = async () => {
        try {
            const response = await api.get('/places?limit=100');
            const validPlaces = response.data.data.filter(
                p => p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number'
            );
            setPlaces(validPlaces);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching places:', error);
            setLoading(false);
        }
    };

    const filteredPlaces = selectedCategory === 'all'
        ? places
        : places.filter(p => p.category === selectedCategory);

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

    const getCategoryColor = (category) => {
        const colors = {
            history: '#f59e0b',
            nature: '#10b981',
            hotel: '#3b82f6',
            restaurant: '#f97316',
            transport: '#a855f7',
        };
        return colors[category] || '#1392ec';
    };

    const createCustomIcon = (category) => {
        const color = getCategoryColor(category);
        const iconName = getCategoryIcon(category);

        return L.divIcon({
            className: 'custom-map-marker',
            html: `
                <div style="
                    background-color: ${color};
                    width: 36px;
                    height: 36px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
                    border: 2px solid white;
                ">
                    <span class="material-symbols-outlined" style="
                        transform: rotate(45deg);
                        color: white;
                        font-size: 20px;
                    ">${iconName}</span>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        });
    };

    // Update markers when filteredPlaces or language changes
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();

        filteredPlaces.forEach((place) => {
            const lat = place.location.lat;
            const lng = place.location.lng;

            const marker = L.marker([lat, lng], {
                icon: createCustomIcon(place.category),
            });

            const popupContent = `
                <div class="popup-card">
                    <div class="popup-image" style="background-image: url('${place.images && place.images[0] ? resolveImg(place.images[0]) : 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400'}')"></div>
                    <div class="popup-content-inner">
                        <div class="popup-header-info">
                            <span class="popup-badge" style="background-color: ${getCategoryColor(place.category)}20; color: ${getCategoryColor(place.category)}">
                                <span class="material-symbols-outlined">${getCategoryIcon(place.category)}</span>
                                ${t.categories[place.category] || place.category}
                            </span>
                            <span class="popup-rating">
                                <span class="material-symbols-outlined">star</span>
                                ${place.rating.toFixed(1)}
                            </span>
                        </div>
                        <h3 class="popup-title">${place.title[language]}</h3>
                        <p class="popup-desc">${place.description[language].length > 80 ? place.description[language].substring(0, 80) + '...' : place.description[language]}</p>
                        <div class="popup-actions">
                            <a href="/place/${place._id}" class="popup-btn-details">${t.buttons?.viewDetails || 'Detaylar'}</a>
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" class="popup-btn-directions">
                                <span class="material-symbols-outlined">directions</span>
                                ${language === 'tr' ? 'Yol Tarifi' : 'Directions'}
                            </a>
                        </div>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, { className: 'custom-popup', maxWidth: 300 });

            marker.on('click', () => {
                setSelectedPlace(place);
            });

            marker.addTo(markersLayerRef.current);
        });
    }, [filteredPlaces, language]);

    // Fly to selected place
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        if (selectedPlace && selectedPlace.location) {
            const lat = selectedPlace.location.lat;
            const lng = selectedPlace.location.lng;
            mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
        }
    }, [selectedPlace]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>{language === 'tr' ? 'Harita Yükleniyor...' : 'Loading Map...'}</p>
            </div>
        );
    }

    return (
        <div className="interactive-map-page">
            <Navbar />

            <div className="map-page-content">
                {/* Sidebar */}
                <aside className="map-sidebar">
                    <div className="sidebar-header-map">
                        <h2>{language === 'tr' ? 'Fatsa Haritası' : 'Fatsa Map'}</h2>
                        <p>{language === 'tr' ? `${filteredPlaces.length} yer gösteriliyor` : `Showing ${filteredPlaces.length} places`}</p>
                    </div>

                    {/* Category Filter */}
                    <div className="category-filter">
                        <button
                            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('all'); setSelectedPlace(null); }}
                        >
                            <span className="material-symbols-outlined">category</span>
                            {language === 'tr' ? 'Tümü' : 'All'}
                        </button>
                        <button
                            className={`filter-btn ${selectedCategory === 'history' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('history'); setSelectedPlace(null); }}
                        >
                            <span className="material-symbols-outlined">history_edu</span>
                            {t.categories.history}
                        </button>
                        <button
                            className={`filter-btn ${selectedCategory === 'nature' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('nature'); setSelectedPlace(null); }}
                        >
                            <span className="material-symbols-outlined">forest</span>
                            {t.categories.nature}
                        </button>
                        <button
                            className={`filter-btn ${selectedCategory === 'hotel' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('hotel'); setSelectedPlace(null); }}
                        >
                            <span className="material-symbols-outlined">hotel</span>
                            {t.categories.hotel}
                        </button>
                        <button
                            className={`filter-btn ${selectedCategory === 'restaurant' ? 'active' : ''}`}
                            onClick={() => { setSelectedCategory('restaurant'); setSelectedPlace(null); }}
                        >
                            <span className="material-symbols-outlined">restaurant</span>
                            {t.categories.restaurant}
                        </button>
                    </div>

                    {/* Places List */}
                    <div className="places-list-sidebar">
                        {filteredPlaces.map((place) => (
                            <div
                                key={place._id}
                                className={`sidebar-place-card ${selectedPlace?._id === place._id ? 'selected' : ''}`}
                                onClick={() => setSelectedPlace(place)}
                            >
                                <div
                                    className="sidebar-place-image"
                                    style={{
                                        backgroundImage: place.images[0]
                                            ? `url(${resolveImg(place.images[0])})`
                                            : 'url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200)'
                                    }}
                                />
                                <div className="sidebar-place-info">
                                    <div className="sidebar-place-category" style={{ color: getCategoryColor(place.category) }}>
                                        <span className="material-symbols-outlined">{getCategoryIcon(place.category)}</span>
                                    </div>
                                    <h4>{place.title[language]}</h4>
                                    <div className="sidebar-place-rating">
                                        <span className="material-symbols-outlined">star</span>
                                        {place.rating.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Leaflet Map (direct, no react-leaflet) */}
                <div className="map-container-full" style={{ zIndex: 0 }}>
                    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>
        </div>
    );
}

export default InteractiveMap;
