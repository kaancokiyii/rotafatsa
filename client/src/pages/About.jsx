import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './About.css';

function About() {
    const { language } = useLanguage();

    const sections = [
        {
            icon: 'info',
            title: { tr: 'Fatsa Nedir?', en: 'What is Fatsa?' },
            text: {
                tr: "Fatsa, Karadeniz Bölgesi'nde Ordu ili'ne bağlı bir ilçedir. Zengin tarihi, muhteşem doğası ve misafirperver insanlarıyla ünlüdür. Karadeniz kıyısında yer alan Fatsa, hem deniz hem de yeşil doğa tutkunları için ideal bir destinasyondur.",
                en: 'Fatsa is a district of Ordu province in the Black Sea Region. It is famous for its rich history, magnificent nature, and hospitable people. Located on the Black Sea coast, Fatsa is an ideal destination for both sea and green nature enthusiasts.'
            }
        },
        {
            icon: 'history_edu',
            title: { tr: 'Tarih', en: 'History' },
            text: {
                tr: "Fatsa'nın tarihi MÖ 7. yüzyıla kadar uzanmaktadır. Bölge, tarih boyunca birçok medeniyete ev sahipliği yapmıştır. Bolaman Kalesi gibi tarihi yapılar, bölgenin zengin geçmişinin izlerini taşımaktadır.",
                en: "Fatsa's history dates back to the 7th century BC. The region has been home to many civilizations throughout history. Historical structures such as Bolaman Castle carry traces of the region's rich past."
            }
        },
        {
            icon: 'terrain',
            title: { tr: 'Coğrafya', en: 'Geography' },
            text: {
                tr: "Fatsa, Karadeniz'in kıyısında yer alır ve yaklaşık 440 km² alana sahiptir. İlçe, hem deniz seviyesindeki sahil şeridi hem de yüksek dağlık alanlarıyla çeşitli bir coğrafyaya sahiptir. Gaga Gölü gibi doğal güzellikler, bölgenin önemli cazibe merkezleridir.",
                en: 'Fatsa is located on the coast of the Black Sea and has an area of approximately 440 km². The district has a diverse geography with both a coastal strip at sea level and high mountainous areas. Natural beauties such as Gaga Lake are important attractions of the region.'
            }
        },
        {
            icon: 'festival',
            title: { tr: 'Kültür', en: 'Culture' },
            text: {
                tr: "Fatsa, zengin Karadeniz kültürünün önemli merkezlerinden biridir. Hamsi festivali, horon gösterileri ve geleneksel el sanatları bölgenin kültürel zenginliğini yansıtır. Yöresel mutfak, özellikle balık ve mısır ürünleri ile ünlüdür.",
                en: 'Fatsa is one of the important centers of the rich Black Sea culture. The anchovy festival, horon performances, and traditional handicrafts reflect the cultural richness of the region. Local cuisine is famous for fish and corn products.'
            }
        },
    ];

    const stats = [
        { icon: 'groups', value: '~120,000', label: { tr: 'Nüfus', en: 'Population' } },
        { icon: 'landscape', value: '440 km²', label: { tr: 'Alan', en: 'Area' } },
        { icon: 'place', value: '15+', label: { tr: 'Turistik Yer', en: 'Tourist Sites' } },
        { icon: 'wb_sunny', value: '15°C', label: { tr: 'Ort. Sıcaklık', en: 'Avg. Temp' } },
    ];

    return (
        <div className="abt-page">
            <Navbar />

            {/* Header */}
            <section className="abt-header" style={{ backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="abt-container">
                    <span className="abt-header__badge">
                        <span className="material-symbols-outlined">info</span>
                        {language === 'tr' ? 'HAKKIMIZDA' : 'ABOUT US'}
                    </span>
                    <h1>{language === 'tr' ? "Fatsa'yı Tanıyın" : 'Discover Fatsa'}</h1>
                    <p>{language === 'tr'
                        ? "Karadeniz'in kalbindeki bu eşsiz ilçeyi yakından tanıyın."
                        : 'Get to know this unique town in the heart of the Black Sea.'}</p>
                </div>
            </section>

            {/* Stats */}
            <section className="abt-stats-section">
                <div className="abt-container">
                    <div className="abt-stats">
                        {stats.map((s, i) => (
                            <div key={i} className="abt-stat">
                                <span className="material-symbols-outlined">{s.icon}</span>
                                <h3>{s.value}</h3>
                                <p>{s.label[language] || s.label.en}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <section className="abt-content">
                <div className="abt-container">
                    {sections.map((sec, i) => (
                        <div key={i} className={`abt-block ${i % 2 !== 0 ? 'abt-block--alt' : ''}`}>
                            <div className="abt-block__icon">
                                <span className="material-symbols-outlined">{sec.icon}</span>
                            </div>
                            <div className="abt-block__text">
                                <h2>{sec.title[language] || sec.title.en}</h2>
                                <p>{sec.text[language] || sec.text.en}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default About;
