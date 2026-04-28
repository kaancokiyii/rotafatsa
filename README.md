# Rota Fatsa - Tourism Web Application

A comprehensive tourism web application for Fatsa Municipality featuring a RESTful API backend (Node.js/Express/MongoDB) and a modern React frontend.

## 🌟 Features

### Backend API
- **Multi-language Support**: All content available in Turkish (TR), English (EN), and Arabic (AR)
- **JWT Authentication**: Secure admin authentication with JSON Web Tokens
- **RESTful API**: Complete CRUD operations for places, events, and routes
- **AI Chatbot**: Simple text search-based recommendation system
- **Image Upload**: Local file storage with Multer (cloud storage ready)
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Global error handler with detailed error messages

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Joi
- **File Uploads**: Multer
- **CORS**: Enabled for React frontend

## 📁 Project Structure

```
rtfatsa/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── chatController.js    # AI chatbot logic
│   ├── eventController.js   # Events CRUD
│   ├── placeController.js   # Places CRUD
│   └── routeController.js   # Routes logic
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Global error handler
│   └── validate.js          # Validation middleware
├── models/
│   ├── Event.js             # Event schema
│   ├── Place.js             # Place schema
│   ├── Route.js             # Route schema
│   └── User.js              # User schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── chat.js              # Chat routes
│   ├── events.js            # Event routes
│   ├── places.js            # Place routes
│   └── routes.js            # Route routes
├── uploads/                 # Uploaded images
├── utils/
│   ├── multerConfig.js      # File upload config
│   └── validators.js        # Joi schemas
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json
├── seed.js                  # Database seeding
└── server.js                # Main server file
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Setup

1. **Clone or navigate to the project**
   ```bash
   cd e:\rtfatsa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Update `.env` file with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/rota-fatsa
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system.

5. **Seed the database**
   ```bash
   npm run seed
   ```

   This will create:
   - 1 admin user (username: `admin`, password: `admin123`)
   - 5 tourist places (Bolaman Castle, Gaga Lake, etc.)
   - 3 transportation routes
   - 3 cultural events

6. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Places (Public)

#### Get All Places
```http
GET /api/places?category=nature&page=1&limit=10
```

#### Get Single Place
```http
GET /api/places/:id
```

### Places (Protected - Admin Only)

#### Create Place
```http
POST /api/places
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": {
    "tr": "Yeni Yer",
    "en": "New Place",
    "ar": "مكان جديد"
  },
  "description": { ... },
  "category": "nature",
  "location": {
    "lat": 41.0270,
    "lng": 37.5020,
    "address": "..."
  },
  "images": [file],
  "rating": 4.5,
  "contactInfo": {
    "phone": "+90...",
    "website": "https://..."
  }
}
```

#### Update Place
```http
PUT /api/places/:id
Authorization: Bearer {token}
```

#### Delete Place
```http
DELETE /api/places/:id
Authorization: Bearer {token}
```

### Routes (Public)

#### Get All Routes
```http
GET /api/routes?type=dolmus
```

### Events (Public)

#### Get All Events
```http
GET /api/events?upcoming=true
```

### Events (Protected - Admin Only)

#### Create Event
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": { "tr": "...", "en": "...", "ar": "..." },
  "description": { ... },
  "date": "2026-08-15",
  "location": "Fatsa Pier",
  "image": [file]
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer {token}
```

### AI Chatbot (Public)

#### Chat Query
```http
POST /api/chat
Content-Type: application/json

{
  "query": "nature places"
}
```

**Response:**
```json
{
  "success": true,
  "message": "I found 3 place(s) matching your query...",
  "query": "nature places",
  "recommendations": [...]
}
```

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get the token by logging in with admin credentials.

## 📝 Database Schemas

### Place
- `title` - Multi-language object (tr, en, ar)
- `description` - Multi-language object
- `category` - Enum: history, nature, hotel, restaurant, transport
- `location` - Object with lat, lng, address
- `images` - Array of image URLs
- `rating` - Number (0-5)
- `contactInfo` - Object with phone, website

### Event
- `title` - Multi-language object
- `description` - Multi-language object
- `date` - Date
- `location` - String
- `image` - Image URL

### Route
- `name` - String
- `type` - Enum: bus, dolmus, walking_tour
- `stops` - Array of stop objects

### User
- `username` - String (unique)
- `password` - String (hashed)
- `role` - Enum: admin, editor

## 🌐 Frontend Integration

The API is configured with CORS to accept requests from `http://localhost:3000` (React frontend).

Update `CLIENT_URL` in `.env` for different frontend origins.

## 🛠️ Development

- **Auto-reload**: Uses `nodemon` for development
- **Error Handling**: Comprehensive error messages
- **Validation**: All inputs validated with Joi
- **Security**: Passwords hashed with bcrypt, JWT for auth

## 📦 NPM Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database with sample data
```

## 🚨 Important Notes

1. **Change default admin password** in production
2. **Update JWT_SECRET** to a strong random string
3. **Configure MongoDB URI** for your environment
4. **File uploads** are stored locally in `/uploads` directory
5. For **cloud storage** (Cloudinary/AWS S3), see comments in `utils/multerConfig.js`

## 📄 License

ISC

---

Built with ❤️ for Fatsa Municipality
