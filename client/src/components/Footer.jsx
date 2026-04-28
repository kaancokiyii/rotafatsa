import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

function Footer() {
    const { language } = useLanguage();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-col">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <span className="material-symbols-outlined">sailing</span>
                            </div>
                            <h3>Rota Fatsa</h3>
                        </div>
                        <p className="footer-description">
                            {language === 'tr'
                                ? 'Fatsa\'daki en güzel yerleri keşfedin. Tarih, doğa ve kültürle dolu bir yolculuk.'
                                : language === 'ar'
                                    ? 'اكتشف أجمل الأماكن في فاتسا. رحلة مليئة بالتاريخ والطبيعة والثقافة.'
                                    : 'Discover the most beautiful places in Fatsa. A journey full of history, nature and culture.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4>{language === 'tr' ? 'Hızlı Linkler' : language === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h4>
                        <ul className="footer-links">
                            <li><Link to="/">{language === 'tr' ? 'Ana Sayfa' : language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}</Link></li>
                            <li><Link to="/destinations">{language === 'tr' ? 'Destinasyonlar' : language === 'ar' ? 'وجهات' : 'Destinations'}</Link></li>
                            <li><Link to="/events">{language === 'tr' ? 'Etkinlikler' : language === 'ar' ? 'الفعاليات' : 'Events'}</Link></li>
                            <li><Link to="/map">{language === 'tr' ? 'Harita' : language === 'ar' ? 'خريطة' : 'Map'}</Link></li>
                        </ul>
                    </div>

                    {/* Info */}
                    <div className="footer-col">
                        <h4>{language === 'tr' ? 'Bilgi' : language === 'ar' ? 'معلومات' : 'Information'}</h4>
                        <ul className="footer-links">
                            <li><Link to="/about">{language === 'tr' ? 'Hakkımızda' : language === 'ar' ? 'معلومات عنا' : 'About Us'}</Link></li>
                            <li><Link to="/contact">{language === 'tr' ? 'İletişim' : language === 'ar' ? 'اتصل' : 'Contact'}</Link></li>
                            <li><Link to="/admin/login">{language === 'tr' ? 'Yönetim' : language === 'ar' ? 'إدارة' : 'Admin'}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-col">
                        <h4>{language === 'tr' ? 'İletişim' : language === 'ar' ? 'اتصل بنا' : 'Contact'}</h4>
                        <ul className="footer-contact">
                            <li>
                                <span className="material-symbols-outlined">location_on</span>
                                <span>Fatsa, Ordu, Türkiye</span>
                            </li>
                            <li>
                                <span className="material-symbols-outlined">phone</span>
                                <span><a href="tel:+904524231111" style={{ color: 'inherit', textDecoration: 'none' }}>+90 (452) 423 11 11</a></span>
                            </li>
                            <li>
                                <span className="material-symbols-outlined">email</span>
                                <span><a href="mailto:bilgi@fatsa.bel.tr" style={{ color: 'inherit', textDecoration: 'none' }}>bilgi@fatsa.bel.tr</a></span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p>
                        © 2026 Rota Fatsa. {language === 'tr' ? 'Tüm hakları saklıdır.' : language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
                    </p>
                    <div className="footer-social">
                        <a href="https://facebook.com/fatsabelediyesi" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <span className="material-symbols-outlined">facebook</span>
                        </a>
                        <a href="https://instagram.com/fatsabelediyesi" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <span className="material-symbols-outlined">photo_camera</span>
                        </a>
                        <a href="https://twitter.com/fatsabelediyesi" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <span className="material-symbols-outlined">tag</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
