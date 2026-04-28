import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        // Get from localStorage or default to 'tr'
        return localStorage.getItem('language') || 'tr';
    });

    const setLanguage = (lang) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        // Update HTML lang attribute for accessibility
        document.documentElement.lang = lang;
    };

    useEffect(() => {
        // Set initial HTML lang attribute
        document.documentElement.lang = language;
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
