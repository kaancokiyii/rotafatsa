import { useState, useEffect } from 'react';
import './SplashScreen.css';

function SplashScreen({ onComplete }) {
    const [phase, setPhase] = useState('logo'); // logo → expand → done

    useEffect(() => {
        // Check if already shown this session
        if (sessionStorage.getItem('splashShown')) {
            onComplete();
            return;
        }

        const t1 = setTimeout(() => setPhase('expand'), 800);
        const t2 = setTimeout(() => {
            setPhase('done');
            sessionStorage.setItem('splashShown', 'true');
            onComplete();
        }, 1400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [onComplete]);

    if (sessionStorage.getItem('splashShown')) return null;

    return (
        <div className={`splash-screen ${phase}`}>
            <div className="splash-content">
                <div className="splash-icon">
                    <span className="material-symbols-outlined">sailing</span>
                </div>
                <h1 className="splash-title">
                    <span className="splash-rota">ROTA</span>
                    <span className="splash-fatsa">FATSA</span>
                </h1>
                <div className="splash-line"></div>
            </div>
        </div>
    );
}

export default SplashScreen;
