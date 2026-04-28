import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import api from '../utils/api';
import './ChatBot.css';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { language } = useLanguage();
    const t = translations[language].chat;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Welcome message
            const welcomeMessage = {
                type: 'bot',
                text: language === 'tr'
                    ? 'Merhaba! Fatsa\'yı keşfetmenize yardımcı olabilirim. Ne aramak istersiniz? (örn: "doğal yerler", "tarihi mekanlar", "restoranlar")'
                    : language === 'en'
                        ? 'Hello! I can help you discover Fatsa. What would you like to find? (e.g., "nature spots", "historical places", "restaurants")'
                        : 'مرحبا! يمكنني مساعدتك في اكتشاف فاتسا. ماذا تريد أن تجد؟',
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, language]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            type: 'user',
            text: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await api.post('/chat', { query: inputValue });
            const places = response.data.recommendations || response.data.data || [];

            let botResponse;
            if (places.length > 0) {
                const placesList = places.map(p => `• ${p.title[language]}`).join('\n');
                botResponse = {
                    type: 'bot',
                    text: language === 'tr'
                        ? `${places.length} yer buldum:\n\n${placesList}`
                        : language === 'en'
                            ? `I found ${places.length} places:\n\n${placesList}`
                            : `وجدت ${places.length} أماكن:\n\n${placesList}`,
                    places: places,
                    timestamp: new Date(),
                };
            } else {
                botResponse = {
                    type: 'bot',
                    text: language === 'tr'
                        ? 'Üzgünüm, aramanızla eşleşen yer bulamadım. Başka bir şey deneyin!'
                        : language === 'en'
                            ? 'Sorry, I couldn\'t find any places matching your search. Try something else!'
                            : 'عذرا، لم أتمكن من العثور على أي أماكن مطابقة لبحثك. جرب شيئا آخر!',
                    timestamp: new Date(),
                };
            }

            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                type: 'bot',
                text: language === 'tr'
                    ? 'Bir hata oluştu. Lütfen tekrar deneyin.'
                    : language === 'en'
                        ? 'An error occurred. Please try again.'
                        : 'حدث خطأ. يرجى المحاولة مرة أخرى.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickSuggestions = [
        { tr: '🏰 Tarihi yerler', en: '🏰 Historical places', ar: '🏰 أماكن تاريخية', query: 'tarihi' },
        { tr: '🌲 Doğal alanlar', en: '🌲 Natural areas', ar: '🌲 مناطق طبيعية', query: 'doğa' },
        { tr: '🍽️ Restoranlar', en: '🍽️ Restaurants', ar: '🍽️ مطاعم', query: 'restoran' },
    ];

    return (
        <>
            {/* FAB Button */}
            <div className="rotabot-fab">
                <button
                    className={`fab-button ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="material-symbols-outlined">
                        {isOpen ? 'close' : 'chat_bubble'}
                    </span>
                </button>
            </div>

            {/* Chat Modal */}
            {isOpen && (
                <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="bot-avatar">
                                <span className="material-symbols-outlined">chat_bubble</span>
                            </div>
                            <div>
                                <h3>{t.title}</h3>
                                <span className="status-indicator">
                                    <span className="status-dot"></span>
                                    {language === 'tr' ? 'Çevrimiçi' : language === 'en' ? 'Online' : 'متصل'}
                                </span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.type}`}>
                                {msg.type === 'bot' && (
                                    <div className="message-avatar">
                                        <span className="material-symbols-outlined">chat_bubble</span>
                                    </div>
                                )}
                                <div className="message-content">
                                    <p>{msg.text}</p>
                                    {msg.places && msg.places.length > 0 && (
                                        <div className="places-suggestions">
                                            {msg.places.slice(0, 3).map((place) => (
                                                <a
                                                    key={place._id}
                                                    href={`/place/${place._id}`}
                                                    className="place-suggestion"
                                                >
                                                    <span className="material-symbols-outlined">location_on</span>
                                                    <span>{place.title[language]}</span>
                                                    <span className="material-symbols-outlined">arrow_forward</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <span className="message-time">
                                        {msg.timestamp.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {msg.type === 'user' && (
                                    <div className="message-avatar user">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-avatar">
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length <= 1 && (
                        <div className="quick-suggestions">
                            {quickSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    className="suggestion-chip"
                                    onClick={() => {
                                        setInputValue(suggestion.query);
                                        setTimeout(() => handleSend(), 100);
                                    }}
                                >
                                    {suggestion[language]}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder={t.placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatBot;
