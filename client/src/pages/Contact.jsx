import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import './Contact.css';

function Contact() {
    const { language } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/contact', formData);
            toast.success(language === 'tr' ? 'Mesajınız gönderildi!' : 'Message sent!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(language === 'tr' ? 'Mesaj gönderilemedi!' : 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <Navbar />

            <section className="contact-hero">
                <h1>{language === 'tr' ? 'İletişim' : language === 'ar' ? 'اتصل بنا' : 'Contact Us'}</h1>
                <p>
                    {language === 'tr'
                        ? 'Sorularınız için bize ulaşın'
                        : language === 'ar'
                            ? 'تواصل معنا لأي استفسار'
                            : 'Get in touch with us for any inquiry'}
                </p>
            </section>

            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-section">
                            <h2>{language === 'tr' ? 'Mesaj Gönderin' : language === 'ar' ? 'أرسل رسالة' : 'Send a Message'}</h2>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label>{language === 'tr' ? 'Adınız' : language === 'ar' ? 'اسمك' : 'Your Name'}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === 'tr' ? 'E-posta' : language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === 'tr' ? 'Konu' : language === 'ar' ? 'الموضوع' : 'Subject'}</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{language === 'tr' ? 'Mesajınız' : language === 'ar' ? 'رسالتك' : 'Your Message'}</label>
                                    <textarea
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading
                                        ? (language === 'tr' ? 'Gönderiliyor...' : 'Sending...')
                                        : (language === 'tr' ? 'Gönder' : language === 'ar' ? 'إرسال' : 'Send')}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="contact-info-section">
                            <h2>{language === 'tr' ? 'İletişim Bilgileri' : language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}</h2>

                            <div className="info-item">
                                <span className="material-symbols-outlined">location_on</span>
                                <div>
                                    <h4>{language === 'tr' ? 'Adres' : language === 'ar' ? 'عنوان' : 'Address'}</h4>
                                    <p>Fatsa Belediyesi, Fatsa, Ordu, Türkiye</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-outlined">phone</span>
                                <div>
                                    <h4>{language === 'tr' ? 'Telefon' : language === 'ar' ? 'هاتف' : 'Phone'}</h4>
                                    <p><a href="tel:+904524231111" style={{ color: 'inherit', textDecoration: 'none' }}>+90 (452) 423 11 11</a></p>
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-outlined">email</span>
                                <div>
                                    <h4>Email</h4>
                                    <p><a href="mailto:bilgi@fatsa.bel.tr" style={{ color: 'inherit', textDecoration: 'none' }}>bilgi@fatsa.bel.tr</a></p>
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-outlined">schedule</span>
                                <div>
                                    <h4>{language === 'tr' ? 'Çalışma Saatleri' : language === 'ar' ? 'ساعات العمل' : 'Office Hours'}</h4>
                                    <p>{language === 'tr' ? 'Pazartesi - Cuma: 08:00 - 17:00' : 'Monday - Friday: 08:00 - 17:00'}</p>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="contact-map">
                                <iframe
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=37.49,41.02,37.51,41.04&layer=mapnik&marker=41.0289,37.4992"
                                    style={{ width: '100%', height: '300px', border: 'none', borderRadius: '0.75rem' }}
                                    title="Fatsa Location"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default Contact;
