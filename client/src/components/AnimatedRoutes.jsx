import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PlaceDetails from '../pages/PlaceDetails';
import InteractiveMap from '../pages/InteractiveMap';
import Destinations from '../pages/Destinations';
import Events from '../pages/Events';
import Contact from '../pages/Contact';
import About from '../pages/About';
import Hotels from '../pages/Hotels';
import NotFound from '../pages/NotFound';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';

export default function AnimatedRoutes() {
    const location = useLocation();

    return (
        <div key={location.pathname} className="route-transition-wrapper">
            <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/events" element={<Events />} />
                <Route path="/place/:id" element={<PlaceDetails />} />
                <Route path="/map" element={<InteractiveMap />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}
