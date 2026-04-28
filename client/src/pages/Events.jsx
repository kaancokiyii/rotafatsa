import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { resolveImg } from '../utils/imageUtils';
import './Events.css';

function Events() {
    const { language } = useLanguage();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => { fetchEvents(); }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events?upcoming=false');
            setEvents(response.data.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const monthNames = {
        tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    };

    const dayNames = {
        tr: ['PZR', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'],
        en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    };

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays = new Date(year, month, 0).getDate();
        const days = [];

        // Previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevDays - i, current: false });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, current: true });
        }
        // Next month
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, current: false });
        }
        return days;
    }, [year, month]);

    const getEventsForDay = (day) => {
        return events.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const upcomingEvents = events
        .filter(e => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const isToday = (day) => {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatFullDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={language === 'tr' ? 'Etkinlikler yükleniyor...' : 'Loading events...'} />;
    }

    return (
        <div className="ev-page">
            <Navbar />

            {/* Header */}
            <section className="ev-header">
                <div className="ev-container">
                    <div className="ev-header__text">
                        <h1>{language === 'tr' ? 'Fatsa Etkinlikleri' : 'Events in Fatsa'}</h1>
                        <p>{language === 'tr'
                            ? 'Şehrimizin kalbini keşfedin. Yerel kültür, spor turnuvaları ve geleneksel festivaller.'
                            : 'Discover the heartbeat of our city. Explore local culture, exciting sports tournaments, and traditional festivals.'}</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="ev-content">
                <div className="ev-container">
                    <div className="ev-layout">
                        {/* Calendar */}
                        <div className="ev-calendar">
                            <div className="ev-cal__header">
                                <h2>{(monthNames[language] || monthNames.en)[month]} {year}</h2>
                                <div className="ev-cal__nav">
                                    <button onClick={prevMonth}><span className="material-symbols-outlined">chevron_left</span></button>
                                    <button onClick={nextMonth}><span className="material-symbols-outlined">chevron_right</span></button>
                                    <button className="ev-cal__today" onClick={goToday}>{language === 'tr' ? 'Bugün' : 'Today'}</button>
                                </div>
                            </div>

                            <div className="ev-cal__grid">
                                {(dayNames[language] || dayNames.en).map(d => (
                                    <div key={d} className="ev-cal__day-name">{d}</div>
                                ))}
                                {calendarDays.map((d, i) => {
                                    const dayEvents = d.current ? getEventsForDay(d.day) : [];
                                    return (
                                        <div
                                            key={i}
                                            className={`ev-cal__cell ${!d.current ? 'ev-cal__cell--other' : ''} ${d.current && isToday(d.day) ? 'ev-cal__cell--today' : ''}`}
                                        >
                                            <span className="ev-cal__date">{d.day}</span>
                                            {dayEvents.map(ev => (
                                                <div
                                                    key={ev._id}
                                                    className="ev-cal__event"
                                                    onClick={() => setSelectedEvent(ev)}
                                                    title={ev.title[language]}
                                                >
                                                    {ev.title[language].length > 12 ? ev.title[language].substring(0, 12) + '…' : ev.title[language]}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Upcoming Sidebar */}
                        <div className="ev-sidebar">
                            <div className="ev-sidebar__header">
                                <h3>{language === 'tr' ? 'Yaklaşan Etkinlikler' : 'Upcoming Events'}</h3>
                            </div>
                            <div className="ev-sidebar__list">
                                {upcomingEvents.length === 0 ? (
                                    <p className="ev-sidebar__empty">{language === 'tr' ? 'Yaklaşan etkinlik yok' : 'No upcoming events'}</p>
                                ) : (
                                    upcomingEvents.map(ev => {
                                        const d = new Date(ev.date);
                                        const monthShort = (monthNames[language] || monthNames.en)[d.getMonth()].substring(0, 3);
                                        return (
                                            <div key={ev._id} className="ev-sidebar__item" onClick={() => setSelectedEvent(ev)}>
                                                <div className="ev-sidebar__img" style={{ backgroundImage: ev.image ? `url(${resolveImg(ev.image)})` : 'url(https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200)' }}></div>
                                                <div className="ev-sidebar__info">
                                                    <h4>{ev.title[language]}</h4>
                                                    <p>
                                                        <span className="material-symbols-outlined">calendar_month</span>
                                                        {monthShort} {d.getDate()}, {formatTime(ev.date)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="ev-modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="ev-modal" onClick={e => e.stopPropagation()}>
                        <button className="ev-modal__close" onClick={() => setSelectedEvent(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        {selectedEvent.image && (
                            <div className="ev-modal__img" style={{ backgroundImage: `url(${resolveImg(selectedEvent.image)})` }}></div>
                        )}
                        <div className="ev-modal__body">
                            <h2>{selectedEvent.title[language]}</h2>
                            <div className="ev-modal__meta">
                                <span><span className="material-symbols-outlined">calendar_month</span> {formatFullDate(selectedEvent.date)}</span>
                                <span><span className="material-symbols-outlined">location_on</span> {selectedEvent.location}</span>
                            </div>
                            <p className="ev-modal__desc">{selectedEvent.description[language]}</p>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Events;
