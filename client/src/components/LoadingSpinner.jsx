import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ fullScreen = false, message }) {
    if (fullScreen) {
        return (
            <div className="loading-fullscreen">
                <div className="spinner-large"></div>
                {message && <p className="loading-message">{message}</p>}
            </div>
        );
    }

    return (
        <div className="loading-inline">
            <div className="spinner-small"></div>
        </div>
    );
}

export default LoadingSpinner;
