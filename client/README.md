# Rota Fatsa Frontend

React-based frontend for the Rota Fatsa tourism web application.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Backend server running on `http://localhost:5000`

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── HomePage.css
│   │   ├── PlaceDetails.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminLogin.css
│   │   └── AdminDashboard.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Features

- **Multi-language Support**: Turkish, English, Arabic
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Glassmorphism, gradients, animations
- **API Integration**: Axios with authentication
- **Routing**: React Router for navigation
- **Admin Panel**: Protected admin routes

## 🔗 API Endpoints

All API calls are proxied to `http://localhost:5000/api` via Vite configuration.

- Places: `/api/places`
- Events: `/api/events`
- Routes: `/api/routes`
- Chat: `/api/chat`
- Auth: `/api/auth/login`

## 🎯 Pages

- **Home** (`/`): Main landing page with hero, places, and events
- **Place Details** (`/place/:id`): Detailed place information
- **Admin Login** (`/admin/login`): Admin authentication
- **Admin Dashboard** (`/admin/dashboard`): Admin panel (protected)

## 🔐 Authentication

Tokens are stored in localStorage and automatically attached to API requests.

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Design Tokens

- Primary: `#1392ec`
- Primary Dark: `#0e7ac4`
- Secondary: `#10b981`
- Background Light: `#f6f7f8`
- Background Dark: `#101a22`

## 🛠️ Technologies

- **React** 18
- **Vite** 5
- **React Router** 6
- **Axios** 1.6
- **Material Symbols** (Icons)
- **Google Fonts** (Plus Jakarta Sans)

---

Built with ❤️ for Fatsa Municipality
