import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import './Navbar.css';

function Navbar() {
    const { language, setLanguage } = useLanguage();
    const t = translations[language];
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            // Transform to sticky header after 50px
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'auto'; // Reset body scroll
    }, [location]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
    };

    return (
        <>
            <nav className={`floating-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">

                    {/* Logo Section */}
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon">
                            <span className="material-symbols-outlined">travel_explore</span>
                        </div>
                        <div className="logo-text">
                            <span className="brand-rota">ROTA</span>
                            <span className="brand-fatsa">FATSA</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="nav-links">
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                            <span className="link-text">{t.nav.home}</span>
                        </Link>
                        <Link to="/destinations" className={`nav-link ${location.pathname.startsWith('/destinations') ? 'active' : ''}`}>
                            <span className="link-text">{t.nav.destinations}</span>
                        </Link>
                        <Link to="/events" className={`nav-link ${location.pathname.startsWith('/events') ? 'active' : ''}`}>
                            <span className="link-text">{t.nav.events}</span>
                        </Link>
                        <Link to="/map" className={`nav-link ${location.pathname.startsWith('/map') ? 'active' : ''}`}>
                            <span className="link-text">{language === 'tr' ? 'HARİTA' : 'MAP'}</span>
                        </Link>
                        <Link to="/hotels" className={`nav-link ${location.pathname.startsWith('/hotels') ? 'active' : ''}`}>
                            <span className="link-text">{language === 'tr' ? 'OTELLER' : 'HOTELS'}</span>
                        </Link>
                        <Link to="/about" className={`nav-link ${location.pathname.startsWith('/about') ? 'active' : ''}`}>
                            <span className="link-text">{language === 'tr' ? 'HAKKINDA' : 'ABOUT'}</span>
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="nav-actions">
                        <div className="lang-switch">
                            <button className={language === 'tr' ? 'active' : ''} onClick={() => setLanguage('tr')}>TR</button>
                            <span className="divider">/</span>
                            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
                        </div>

                        <Link to="/contact" className="action-btn-primary">
                            <span>{t.nav.contact}</span>
                            <span className="material-symbols-outlined icon-arrow">arrow_outward</span>
                        </Link>

                        <button className="mobile-toggle" onClick={toggleMobileMenu}>
                            <span className="material-symbols-outlined">menu_open</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-content">
                    <button className="mobile-close" onClick={toggleMobileMenu}>
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="mobile-nav-items">
                        <Link to="/" className="mobile-link">{t.nav.home}</Link>
                        <Link to="/destinations" className="mobile-link">{t.nav.destinations}</Link>
                        <Link to="/events" className="mobile-link">{t.nav.events}</Link>
                        <Link to="/map" className="mobile-link">{language === 'tr' ? 'HARİTA' : 'MAP'}</Link>
                        <Link to="/hotels" className="mobile-link">{language === 'tr' ? 'OTELLER' : 'HOTELS'}</Link>
                        <Link to="/about" className="mobile-link">{language === 'tr' ? 'HAKKINDA' : 'ABOUT'}</Link>
                        <Link to="/contact" className="mobile-link highlight">{t.nav.contact}</Link>
                    </div>

                    <div className="mobile-footer">
                        <div className="mobile-lang">
                            <button className={language === 'tr' ? 'active' : ''} onClick={() => setLanguage('tr')}>Türkçe</button>
                            <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Navbar;
