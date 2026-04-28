import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SplashScreen from './components/SplashScreen';
import ScrollToTop from './components/ScrollToTop';
import AnimatedRoutes from './components/AnimatedRoutes';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
    const [splashDone, setSplashDone] = useState(!!sessionStorage.getItem('splashShown'));
    const handleSplashComplete = useCallback(() => setSplashDone(true), []);

    return (
        <>
            {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
            <Router>
                <ScrollToTop />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#fff',
                            color: '#1f2937',
                            padding: '16px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <AnimatedRoutes />
                <ChatBot />
            </Router>
        </>
    );
}

export default App;
