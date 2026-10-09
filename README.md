# AeroMobilityAI

**AI-Powered Environmental Intelligence System for Air Quality Prediction and Smart Mobility Recommendations**


[![Python](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.3-61dafb)](https://react.dev/)
[![TensorFlow](https://img.shields.io/badge/tensorflow-keras-orange)](https://www.tensorflow.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A full-stack Progressive Web Application (PWA) that combines real-time air quality monitoring, 24-hour AQI forecasting using deep learning, and intelligent route recommendations to help users make health-conscious travel decisions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Machine Learning Approach](#machine-learning-approach)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Database & Security](#database--security)
- [External APIs & Limitations](#external-apis--limitations)
- [PWA Installation](#pwa-installation)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

AeroMobilityAI is an environmental intelligence platform that empowers users to navigate urban environments while minimizing exposure to air pollution. The system leverages a GRU-based deep learning model trained on historical air quality data to predict AQI levels up to 24 hours in advance, integrated with real-time route planning and health-aware recommendation algorithms.

**Problem Statement:** Urban air pollution poses significant health risks, especially for vulnerable populations with respiratory conditions, cardiovascular disease, or age-related sensitivities. Traditional navigation systems optimize for time and distance but ignore environmental factors.

**Solution:** AeroMobilityAI provides:
- Real-time air quality monitoring at 1000+ stations across India
- 24-hour AQI forecasts using deep learning (GRU neural networks)
- Multi-route analysis with AQI scoring for each path
- Health-profile-based route recommendations (General, Respiratory, Cardiovascular, Children, Elderly)
- Interactive mapping with pollution hotspot visualization
- Conversational AI assistant for journey planning and environmental insights

---

## 🚀 Live Demo

**Frontend (PWA):** [https://your-vercel-deployment-url.vercel.app](https://your-vercel-deployment-url.vercel.app)

> **Note:** Replace the URL above with your actual Vercel deployment URL. The backend Flask API is currently configured for local development or requires separate deployment infrastructure.

---

## ✨ Key Features

### 🤖 AI-Powered AQI Forecasting
- **24-hour forecasting** using GRU (Gated Recurrent Unit) neural networks
- **72-hour historical input window** for accurate temporal pattern recognition
- **65 engineered features** including meteorological data, temporal cycles, and station-specific characteristics
- **Test performance:** MAE: 35.32, RMSE: 49.43, R²: 0.863

### 🗺️ Smart Route Recommendations
- **Multi-route analysis** using Google Maps API with real-time traffic data
- **AQI-aware scoring** that evaluates average and peak pollution exposure along each route
- **Health profile customization** with specialized weighting for vulnerable populations
- **Interactive map visualization** with color-coded route segments based on AQI levels

### 🏥 Health-Conscious Design
- **5 health profiles:** General, Respiratory Issues, Cardiovascular Disease, Children, Elderly
- **Dynamic scoring algorithm** that balances travel time, pollution exposure, and health sensitivity
- **Real-time environmental data** including PM2.5, PM10, NO₂, SO₂, CO, O₃, UV index, and weather conditions

### 💬 Conversational AI Assistant
- **Natural language journey planning** powered by xAI Grok API
- **Context-aware recommendations** based on current conditions, forecast data, and user health profile
- **Multi-turn conversation** with persistent chat history

### 📱 Progressive Web App
- **Installable** on mobile and desktop devices
- **Offline-capable** with service worker caching
- **Responsive design** optimized for all screen sizes
- **Native app-like experience** with fast loading and smooth interactions

### 👤 User Profile & History
- **Secure authentication** with email/password and bcrypt hashing
- **Journey history tracking** with MongoDB persistence
- **Saved places** for quick access to frequent destinations
- **Personalized recommendations** based on user health profile and preferences

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - Modern component-based UI library
- **Vite 5.4** - Fast build tool and development server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Google Maps JavaScript API** - Interactive mapping and route visualization
- **Vite PWA Plugin** - Service worker and manifest generation

### Backend
- **Flask 3.1** - Lightweight Python web framework
- **TensorFlow/Keras** - Deep learning model inference
- **NumPy & Pandas** - Data preprocessing and feature engineering
- **scikit-learn 1.7** - Feature scaling and model evaluation
- **PyMongo 4.10** - MongoDB database client

### Machine Learning
- **Model Architecture:** Gated Recurrent Unit (GRU) neural network
- **Framework:** TensorFlow/Keras
- **Training Data:** 350,000+ historical AQI records from Indian monitoring stations
- **Features:** 65 engineered features (meteorological, temporal, categorical)
- **Loss Function:** Mean Squared Error (MSE)

### External APIs
- **Google Maps API** - Route planning, geocoding, distance matrix
- **TomTom Traffic API** - Real-time traffic data
- **Open-Meteo API** - Weather and air quality data (PM2.5, PM10, gases, UV index)
- **xAI Grok API** - Conversational AI assistant
- **SerpAPI** (optional) - Search-based environmental insights

### Database & Storage
- **MongoDB** - User profiles, journey history, saved places
- **Local file storage** - Pre-trained model artifacts (`.keras`, `.joblib`)

### Deployment
- **Vercel** - Frontend hosting with automatic deployments
- **Flask development server** - Backend (local or cloud deployment required)

---

## 🧠 Machine Learning Approach

### Dataset
- **Source:** Historical AQI data from 1000+ monitoring stations across India
- **Size:** 350,000+ records with hourly granularity
- **Features:** PM2.5, PM10, NO₂, SO₂, CO, O₃, temperature, humidity, wind speed/direction, weather conditions, temporal cycles
- **Target Variable:** AQI (Air Quality Index)

### Data Preprocessing
1. **Temporal sorting** by station and timestamp
2. **Feature engineering:**
   - Cyclical encoding (hour, day of week, month, wind direction)
   - One-hot encoding for weather conditions and station IDs
   - Normalization using StandardScaler
3. **Sequence creation:** 72-hour input windows → 24-hour forecast horizons
4. **Train/test split:** 80/20 with temporal ordering preserved

### Model Architecture
```
Input Layer: (72 timesteps, 65 features)
  ↓
GRU Layer (128 units, return_sequences=True)
  ↓
GRU Layer (64 units, return_sequences=False)
  ↓
Dense Layer (32 units, ReLU activation)
  ↓
Output Layer (24 units) - 24-hour AQI predictions
```

### Performance Metrics
- **Mean Absolute Error (MAE):** 35.32
- **Root Mean Squared Error (RMSE):** 49.43
- **R² Score:** 0.863

### Model Files
- `aqi_gru_24h_current.keras` - Trained GRU model
- `feature_scaler.joblib` - StandardScaler for input features
- `target_scaler.joblib` - StandardScaler for AQI target
- `feature_columns.json` - Feature name ordering
- `model_config.json` - Model metadata and hyperparameters
- `stations.json` - Station metadata for predictions

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  - User Interface (Journey Planner, Map, Chat, History)        │
│  - Google Maps API Integration                                  │
│  - PWA Service Worker                                           │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS/REST API
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask API)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AQI Predictor│  │ Route Scorer │  │ Chat Service │         │
│  │   (GRU ML)   │  │   (Multi-    │  │   (xAI API)  │         │
│  │              │  │   criteria)  │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         ↓                  ↓                  ↓                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │           External API Orchestration              │         │
│  │  - Google Maps  - TomTom  - Open-Meteo           │         │
│  └──────────────────────────────────────────────────┘         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                         │
│  - User Profiles & Authentication                               │
│  - Journey History                                              │
│  - Saved Places                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Example: Route Planning
1. **User** enters origin, destination, and health profile in frontend
2. **Frontend** calls `/api/routes/find` with coordinates and health profile
3. **Backend** fetches multiple route options from Google Maps API
4. **Backend** samples points along each route and queries AQI data from Open-Meteo
5. **Backend** applies health-profile-weighted scoring algorithm
6. **Backend** saves journey to MongoDB history collection
7. **Frontend** displays ranked routes with interactive map visualization
8. **User** selects optimal route based on AQI, traffic, and travel time

---

## 📁 Project Structure

```
aero_mobility/
├── backend/
│   ├── app.py                          # Flask application entry point
│   ├── requirements.txt                # Python dependencies
│   ├── vercel.json                     # Vercel deployment configuration
│   ├── db.py                           # MongoDB connection handler
│   ├── config/
│   │   └── settings.py                 # Application configuration
│   ├── models/
│   │   ├── aqi_model/                  # Pre-trained ML model artifacts
│   │   │   ├── aqi_gru_24h_current.keras
│   │   │   ├── feature_scaler.joblib
│   │   │   ├── target_scaler.joblib
│   │   │   ├── feature_columns.json
│   │   │   ├── model_config.json
│   │   │   └── stations.json
│   │   ├── trip_history.py             # Journey history data model
│   │   └── saved_places.py             # Saved places data model
│   ├── routes/
│   │   ├── aqi_routes.py               # AQI and prediction endpoints
│   │   ├── route_routes.py             # Route finding and ranking
│   │   ├── history_routes.py           # Journey history CRUD
│   │   ├── auth_routes.py              # User authentication
│   │   ├── chat_routes.py              # AI assistant chat
│   │   └── places_routes.py            # Saved places CRUD
│   ├── services/
│   │   ├── prediction_service.py       # ML model inference
│   │   ├── aqi_service.py              # AQI data retrieval
│   │   ├── route_service.py            # Google Maps integration
│   │   ├── route_aqi_service.py        # Route-level AQI calculation
│   │   ├── scoring_service.py          # Health-profile-based ranking
│   │   ├── chat_service.py             # xAI Grok integration
│   │   ├── open_meteo_service.py       # Open-Meteo API client
│   │   ├── traffic_service.py          # TomTom traffic data
│   │   ├── weather_service.py          # Weather data aggregation
│   │   └── gps_service.py              # Coordinate validation
│   ├── utils/
│   │   ├── helpers.py                  # Utility functions
│   │   └── mongo.py                    # MongoDB utilities
│   └── data/
│       └── cleaned_aqi_data.csv        # Historical training dataset
│
├── frontend/
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Node.js dependencies
│   ├── vite.config.js                  # Vite build configuration
│   ├── postcss.config.js               # PostCSS/Tailwind configuration
│   ├── public/                         # Static assets
│   │   ├── pwa-192x192.png
│   │   ├── pwa-512x512.png
│   │   └── background_image.jpg
│   └── src/
│       ├── AeroChat.jsx                # Main application component
│       ├── AuthGate.jsx                # Authentication wrapper
│       ├── aqiVisuals.js               # AQI color/category utilities
│       └── components/
│           ├── auth/
│           │   └── AuthFlow.jsx        # Login/register forms
│           ├── chat/
│           │   └── ChatAssistant.jsx   # AI chat interface
│           ├── common/
│           │   ├── Navbar.jsx          # Navigation header
│           │   ├── MetricCard.jsx      # Reusable metric display
│           │   ├── StationPicker.jsx   # Station search dropdown
│           │   └── NotificationDropdown.jsx
│           ├── journey/
│           │   ├── JourneyPlannerForm.jsx
│           │   ├── RouteCard.jsx       # Individual route display
│           │   ├── SelectedRouteSummary.jsx
│           │   ├── AqiForecastSection.jsx
│           │   ├── CurrentConditionsSection.jsx
│           │   ├── SavedPlacesSection.jsx
│           │   └── RecommendationInsight.jsx
│           ├── map/
│           │   └── InteractiveMap.jsx  # Google Maps integration
│           └── screens/
│               ├── HomeScreen.jsx      # Main journey planner
│               ├── HistoryScreen.jsx   # Past trips
│               ├── AboutScreen.jsx     # Project information
│               └── DedicatedMapScreen.jsx
│
├── .gitignore
├── .env.example                        # Environment variable template
└── README.md                           # This file
```

---

## 📋 Prerequisites

- **Python 3.8 or higher** with pip
- **Node.js 16 or higher** with npm
- **MongoDB 4.4 or higher** (local or cloud instance)
- **API Keys:**
  - Google Maps API (with Places, Maps JavaScript, Directions, Geocoding APIs enabled)
  - TomTom API key
  - xAI API key (for Grok chat assistant)
  - SerpAPI key (optional, for search-based insights)

---

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aero_mobility.git
cd aero_mobility
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### Configure Backend Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys (see Environment Variables section)
```

#### Start MongoDB
```bash
# If using local MongoDB:
mongod --dbpath /path/to/your/data/directory

# Or use MongoDB Atlas cloud connection string in .env
```

#### Run the Backend Server
```bash
python app.py
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd ../frontend
npm install
```

#### Configure Frontend Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Google Maps API key
```

#### Run the Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Verify Installation

1. Open `http://localhost:5173` in your browser
2. Create a user account using the registration form
3. Try the "Use My Location" button or enter coordinates manually
4. Check that routes appear on the map with AQI scores

---

## 🔐 Environment Variables

### Backend `.env` Configuration

```bash
# Google Maps API Key (required for route finding, geocoding)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# TomTom API Key (required for traffic data)
TOMTOM_API_KEY=your_tomtom_api_key_here

# MongoDB Connection String (required for user auth and history)
# Local example:
MONGODB_URI=mongodb://127.0.0.1:27017/aeromobility
# Cloud example (MongoDB Atlas):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aeromobility

# xAI API Key (required for chat assistant)
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-2-latest

# SerpAPI Key (optional, for search-based environmental insights)
SERPAPI_KEY=your_serpapi_key_here
```

### Frontend `.env` Configuration

```bash
# Google Maps API Key (required for map display)
# IMPORTANT: Use a separate browser-restricted key for frontend
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> **Security Note:** Never commit actual API keys to version control. The `.env` files are excluded via `.gitignore`. For production, use environment variable management services provided by your hosting platform.

---

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "message": "AQI backend is running"
}
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "health_profile": "general",
  "password": "secure_password"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### AQI Endpoints

#### Search Stations
```http
GET /api/aqi/stations?query=delhi&limit=10
```
**Response:**
```json
{
  "success": true,
  "stations": [
    {
      "station_id": "DPCC_01",
      "station_name": "Delhi - Anand Vihar",
      "city": "Delhi",
      "state": "Delhi"
    }
  ]
}
```

#### Get Current Environmental Data
```http
GET /api/aqi/environment/current?latitude=28.5355&longitude=77.3910
```
**Response:**
```json
{
  "success": true,
  "latitude": 28.5355,
  "longitude": 77.391,
  "current": {
    "pm2_5": 78.5,
    "pm10": 142.3,
    "aqi": 156,
    "temperature": 28.4,
    "humidity": 65,
    "uv_index": 5.2
  }
}
```

#### Get Nearest Station AQI
```http
GET /api/aqi/nearest?latitude=28.7041&longitude=77.1025
```

#### Predict 24-Hour AQI
```http
GET /api/aqi/predict?station_id=DPCC_01
```
**Response:**
```json
{
  "success": true,
  "station_id": "DPCC_01",
  "history_hours": 72,
  "forecast_hours": 24,
  "last_historical_datetime": "2024-03-15T14:00:00",
  "forecast": [
    {
      "datetime": "2024-03-15T15:00:00",
      "predicted_aqi": 145.23
    },
    {
      "datetime": "2024-03-15T16:00:00",
      "predicted_aqi": 138.67
    }
  ]
}
```

### Route Planning

#### Find Routes with AQI Analysis
```http
GET /api/routes/find?origin_lat=28.7041&origin_lng=77.1025&destination_lat=28.5355&destination_lng=77.3910&health_profile=respiratory&origin_name=Connaught%20Place&destination_name=Noida
```

**Response:**
```json
{
  "success": true,
  "recommended_route_id": "route_0",
  "health_profile": "Respiratory Issues",
  "health_profile_key": "respiratory",
  "scoring_weights": {
    "aqi": 0.5,
    "traffic": 0.3,
    "duration": 0.2
  },
  "routes": [
    {
      "route_id": "route_0",
      "distance_km": 18.4,
      "duration_minutes": 32,
      "duration_in_traffic_minutes": 45,
      "traffic_level": "Moderate",
      "aqi": {
        "average_aqi": 142.5,
        "maximum_aqi": 187.2,
        "aqi_category": "Unhealthy",
        "worst_point": {
          "lat": 28.6324,
          "lng": 77.2197,
          "aqi": 187.2
        },
        "points_evaluated": 15
      },
      "score": 68.3,
      "route_points": [...]
    }
  ]
}
```

### Journey History

#### Get Journey History
```http
GET /api/history?page=1&limit=20
```

#### Get Specific Trip
```http
GET /api/history/{trip_id}
```

#### Delete Trip
```http
DELETE /api/history/{trip_id}
```

#### Clear All History
```http
DELETE /api/history
```

### Saved Places

#### List Saved Places
```http
GET /api/places?user_id=user@example.com
```

#### Add Saved Place
```http
POST /api/places
Content-Type: application/json

{
  "user_id": "user@example.com",
  "name": "Home",
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

#### Update Saved Place
```http
PUT /api/places/{place_id}
Content-Type: application/json

{
  "name": "Updated Home",
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

#### Delete Saved Place
```http
DELETE /api/places/{place_id}?user_id=user@example.com
```

### Chat Assistant

#### Send Message to AI Assistant
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What's the best time to travel from Delhi to Noida today?",
  "context": {
    "origin": "Delhi",
    "destination": "Noida",
    "health_profile": "respiratory"
  },
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

The frontend is configured for automatic deployment to Vercel:

1. **Connect Repository to Vercel:**
   - Sign up at [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` directory as the root

2. **Configure Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Add Environment Variables in Vercel Dashboard:**
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_browser_restricted_key
   ```

4. **Deploy:** Vercel will automatically build and deploy on every push to your main branch.

### Backend Deployment Options

The backend requires:
- Python 3.8+ runtime
- Support for TensorFlow/Keras (large ML dependencies)
- Persistent storage for model files (~200MB)
- MongoDB connection

**Option 1: Vercel Serverless Functions**
- The `vercel.json` is configured for Python serverless deployment
- **Limitations:** Cold start times may be high due to TensorFlow loading
- **Note:** The current Vercel Python runtime may not support TensorFlow; consider disabling prediction endpoints or using external ML inference service

**Option 2: Cloud Platforms (Recommended)**
- **Google Cloud Run / AWS App Runner / Azure App Service:**
  - Containerize the Flask app with Docker
  - Include model files in the container image
  - Set environment variables in the platform dashboard
  - Connect to MongoDB Atlas for database

**Option 3: Traditional VPS/Dedicated Server**
- Deploy Flask with Gunicorn + Nginx
- Use systemd for process management
- Configure MongoDB locally or use Atlas

**Environment Variables for Production:**
Ensure all API keys and the MongoDB connection string are set in your deployment platform's environment variable configuration, not in code.

---

## 🔒 Database & Security

### MongoDB Collections

#### `users`
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique index),
  "age": Number,
  "health_profile": String,
  "password_hash": String,
  "profile_image": String (optional)
}
```

#### `trip_history`
```javascript
{
  "_id": ObjectId,
  "from": {
    "name": String,
    "latitude": Number,
    "longitude": Number
  },
  "to": {
    "name": String,
    "latitude": Number,
    "longitude": Number
  },
  "healthProfile": {
    "id": String,
    "name": String
  },
  "routeCount": Number,
  "recommendedRoute": {
    "routeId": String,
    "travelTimeMinutes": Number,
    "distanceKm": Number,
    "aqi": Number,
    "peakAqi": Number,
    "aqiCategory": String,
    "traffic": String,
    "score": Number
  },
  "timestamp": Date
}
```

#### `saved_places`
```javascript
{
  "_id": ObjectId,
  "user_id": String,
  "name": String,
  "latitude": Number,
  "longitude": Number,
  "created_at": Date
}
```

### Security Measures

1. **Password Hashing:** User passwords are hashed using `werkzeug.security.generate_password_hash` (bcrypt-based)
2. **CORS Configuration:** Configured for cross-origin requests (adjust for production)
3. **Input Validation:** Coordinates, email, and user inputs are validated before processing
4. **MongoDB Indexes:** Unique index on `users.email` prevents duplicate accounts
5. **API Key Protection:** Backend API keys are never exposed to the frontend
6. **Error Handling:** Sensitive error details are logged but not exposed to clients

**Production Recommendations:**
- Use HTTPS for all communication
- Implement JWT-based authentication with token expiration
- Add rate limiting to prevent API abuse
- Restrict CORS to specific frontend domains
- Use MongoDB connection string with authentication
- Rotate API keys periodically
- Implement API key quotas and monitoring

---

## 🌐 External APIs & Limitations

### Google Maps API
- **Endpoints Used:** Directions API, Geocoding API, Maps JavaScript API
- **Free Tier:** $200/month credit (~40,000 route requests)
- **Rate Limit:** 50 requests/second per API
- **Recommendation:** Enable billing and set daily quotas to prevent unexpected charges

### TomTom API
- **Usage:** Real-time traffic data
- **Free Tier:** 2,500 requests/day
- **Rate Limit:** Varies by plan
- **Fallback:** System uses Google Maps traffic data if TomTom unavailable

### Open-Meteo API
- **Usage:** Weather and modeled air quality data (PM2.5, PM10, gases, UV index)
- **Free Tier:** Unlimited non-commercial use
- **Rate Limit:** None specified (fair use policy)
- **Reliability:** High availability, no authentication required

### xAI Grok API
- **Usage:** Conversational AI assistant for journey planning
- **Pricing:** Varies by model (grok-2-latest)
- **Rate Limit:** Depends on API tier
- **Fallback:** Chat functionality will show error if API key is missing or quota exceeded

### SerpAPI (Optional)
- **Usage:** Search-based environmental insights (if implemented)
- **Free Tier:** 100 searches/month
- **Paid Plans:** Starting at $50/month for 5,000 searches

### MongoDB Atlas (Cloud Database)
- **Free Tier:** 512MB storage, shared cluster
- **Suitable for:** Development and small-scale production
- **Upgrade Required For:** High-traffic applications (M10+ clusters recommended)

---

## 📱 PWA Installation

AeroMobilityAI is a Progressive Web App that can be installed on devices for a native app-like experience.

### Desktop Installation
1. Visit the deployed URL in Chrome, Edge, or Safari
2. Look for the install icon (⊕) in the address bar
3. Click "Install AeroMobilityAI"
4. The app will open in a standalone window

### Mobile Installation (Android/iOS)

**Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the three-dot menu (⋮)
3. Select "Add to Home screen"
4. Confirm installation

**iOS (Safari):**
1. Open the app URL in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Confirm

### PWA Features
- **Offline Functionality:** Static assets and UI cached for offline viewing
- **Fast Loading:** Service worker caching reduces load times
- **App-Like Interface:** No browser UI, full-screen experience
- **Push Notifications:** (If implemented) Real-time AQI alerts

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'tensorflow'`
- **Solution:** Ensure TensorFlow is installed: `pip install tensorflow`
- **Note:** TensorFlow requires significant disk space (~500MB)

**Problem:** `MongoDB connection failed`
- **Solution:** 
  - Verify MongoDB is running: `mongod --version`
  - Check `MONGODB_URI` in `.env` is correct
  - For cloud MongoDB, ensure IP whitelist includes your server IP

**Problem:** `AQI prediction is not available in this deployment`
- **Solution:** This error appears when TensorFlow failed to load. Check:
  - Python version is 3.8-3.11 (TensorFlow compatibility)
  - Sufficient disk space for model files
  - Model files exist in `backend/models/aqi_model/`

**Problem:** Google Maps API errors (e.g., `REQUEST_DENIED`)
- **Solution:**
  - Enable required APIs in Google Cloud Console: Directions, Geocoding, Maps JavaScript
  - Check API key restrictions (HTTP referrers for frontend, IP addresses for backend)
  - Verify billing is enabled (required even for free tier)

### Frontend Issues

**Problem:** Map not displaying
- **Solution:**
  - Check `VITE_GOOGLE_MAPS_API_KEY` is set in `frontend/.env`
  - Verify API key has Maps JavaScript API enabled
  - Check browser console for specific error messages

**Problem:** Routes not loading
- **Solution:**
  - Verify backend is running at the correct URL
  - Check CORS configuration in `backend/app.py`
  - Inspect browser Network tab for failed requests

**Problem:** Chat assistant not responding
- **Solution:**
  - Verify `XAI_API_KEY` is set in backend `.env`
  - Check xAI API quota and billing status
  - Review backend logs for API error messages

### Development Environment

**Problem:** Vite dev server won't start
- **Solution:**
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again
  - Check for port conflicts (default: 5173)

**Problem:** Flask server crashes on startup
- **Solution:**
  - Check all required environment variables are set
  - Review terminal output for specific error tracebacks
  - Ensure MongoDB is accessible before starting Flask

---

## 🔮 Future Enhancements

The following features are planned but not yet implemented:

### Planned Features
- **Real-time AQI alerts** via push notifications when pollution exceeds thresholds
- **Multi-modal journey planning** (walking, cycling, public transport, car) with mode-specific AQI exposure
- **Predictive route suggestions** based on user's calendar and typical travel patterns
- **Community reporting** of localized pollution hotspots
- **Health impact tracking** showing cumulative pollution exposure over time
- **Wearable device integration** for real-time heart rate and respiration monitoring
- **Regional expansion** to support air quality data for more countries
- **Enhanced ML models** with transformer-based architectures for improved accuracy
- **Carbon footprint calculation** for each route with sustainability recommendations

### Research & Development
- Fine-tune GRU model with more recent data
- Experiment with attention mechanisms for long-term forecasting
- Incorporate satellite imagery for pollution source detection
- Develop personalized health risk scoring using medical literature

**Contributions welcome!** See the Contributing section below.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/aero_mobility.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Ensure backend tests pass (if implemented)
   - Verify frontend builds without errors
   - Test in multiple browsers if UI changes

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe your changes in detail
   - Reference any related issues
   - Wait for review and address feedback

### Areas for Contribution

- **Machine Learning:** Improve AQI prediction accuracy, experiment with new architectures
- **Frontend:** Enhance UI/UX, add animations, improve mobile responsiveness
- **Backend:** Optimize API performance, add caching, improve error handling
- **Testing:** Write unit tests, integration tests, end-to-end tests
- **Documentation:** Improve README, add code comments, create tutorials
- **Accessibility:** Ensure WCAG compliance, add screen reader support
- **Internationalization:** Add multi-language support

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Indian Central Pollution Control Board (CPCB)** for air quality monitoring data
- **Open-Meteo** for free weather and environmental APIs
- **Google Maps Platform** for routing and geocoding services
- **xAI** for Grok conversational AI
- **TensorFlow** and **Keras** teams for deep learning frameworks
- All open-source contributors whose libraries made this project possible

---

## 📊 Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Last Updated:** March 2024

---

## 🔍 Keywords

Air Quality Index, AQI Prediction, Machine Learning, GRU Neural Networks, Deep Learning, Environmental Intelligence, Smart Mobility, Route Optimization, Health-Aware Navigation, Progressive Web App, React, Flask, TensorFlow, Google Maps API, Urban Air Pollution, Respiratory Health, Real-time Environmental Monitoring

---

**Made with ❤️ for healthier urban mobility**

