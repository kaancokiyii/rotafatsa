import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './NotFound.css';

function NotFound() {
    const { language } = useLanguage();

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <div className="error-code">404</div>
                <h1>
                    {language === 'tr'
                        ? 'Sayfa Bulunamadı'
                        : language === 'ar'
                            ? 'الصفحة غير موجودة'
                            : 'Page Not Found'}
                </h1>
                <p>
                    {language === 'tr'
                        ? 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.'
                        : language === 'ar'
                            ? 'الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.'
                            : 'The page you are looking for does not exist or may have been moved.'}
                </p>

                <div className="not-found-actions">
                    <Link to="/" className="btn-primary">
                        <span className="material-symbols-outlined">home</span>
                        {language === 'tr' ? 'Ana Sayf aya Dön' : language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Go Home'}
                    </Link>
                    <Link to="/destinations" className="btn-secondary">
                        <span className="material-symbols-outlined">explore</span>
                        {language === 'tr' ? 'Yerleri Keşfet' : language === 'ar' ? 'استكشف الأماكن' : 'Explore Places'}
                    </Link>
                </div>

                <div className="popular-links">
                    <h3>{language === 'tr' ? 'Popüler Sayfalar:' : language === 'ar' ? 'الصفحات الشائعة:' : 'Popular Pages:'}</h3>
                    <div className="links-grid">
                        <Link to="/destinations">
                            <span className="material-symbols-outlined">location_on</span>
                            {language === 'tr' ? 'Destinasyonlar' : language === 'ar' ? 'وجهات' : 'Destinations'}
                        </Link>
                        <Link to="/map">
                            <span className="material-symbols-outlined">map</span>
                            {language === 'tr' ? 'Harita' : language === 'ar' ? 'خريطة' : 'Map'}
                        </Link>
                        <Link to="/contact">
                            <span className="material-symbols-outlined">mail</span>
                            {language === 'tr' ? 'İletişim' : language === 'ar' ? 'اتصل' : 'Contact'}
                        </Link>
                    </div>
                </div>

                <div className="illustration">
                    <span className="material-symbols-outlined">travel_explore</span>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
