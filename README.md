# AeroMobilityAI

### AI-Powered Environmental Intelligence for Healthier, Smarter Travel




\


AeroMobilityAI is a full-stack environmental intelligence application that combines air quality forecasting, interactive maps, and pollution-aware route recommendations to help users make more informed travel decisions.

The project explores how machine learning and environmental data can complement traditional navigation by considering not only travel time and distance, but also potential exposure to air pollution.

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Machine Learning Approach](#machine-learning-approach)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Database and Security](#database-and-security)
- [External APIs and Limitations](#external-apis-and-limitations)
- [Progressive Web App](#progressive-web-app)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Overview

Air pollution is a major environmental concern, particularly in urban areas where air quality can vary significantly across locations and throughout the day.

Traditional navigation systems primarily focus on travel duration and distance. AeroMobilityAI explores an additional consideration: environmental conditions along a journey.

The application combines historical air quality data, machine learning-based AQI forecasting, environmental information, and route analysis to provide pollution-aware travel recommendations.

### Project Objectives

- Forecast Air Quality Index (AQI) for the next 24 hours.
- Present environmental information in an accessible interface.
- Compare route options using pollution exposure and travel-related factors.
- Support health-aware recommendations through configurable user profiles.
- Maintain user profiles and journey history through backend and database integration.
- Explore the use of AI in environmental intelligence and smart mobility.

## Live Demo

**Live Application:** [Open AeroMobilityAI](YOUR_VERCEL_DEPLOYMENT_URL)

**GitHub Repository:** [View Source Code](YOUR_GITHUB_REPOSITORY_URL)

> Replace these placeholders with the actual public URLs. The live frontend and backend may have separate deployment requirements. Availability of individual features depends on the configuration of the deployed services and their external APIs.

## Key Features

### 1. AI-Powered AQI Forecasting

- Forecasts AQI for the next 24 hours using a trained GRU model.
- Uses a historical sequence of 72 hours as input.
- Processes engineered features representing historical environmental measurements and temporal patterns.
- Presents forecast information to support environmental awareness and journey planning.

### 2. Pollution-Aware Route Recommendations

- Integrates mapping and route information.
- Evaluates route options using available AQI information.
- Considers average and peak pollution levels along evaluated route points.
- Incorporates travel duration, traffic information, and health-profile-based scoring where supported by available data.
- Helps users compare routes using environmental as well as travel-related factors.

### 3. Health-Aware Recommendations

The application includes health-profile categories intended to support different user needs:

- General
- Respiratory sensitivity
- Cardiovascular sensitivity
- Children
- Elderly users

These profiles influence route scoring and recommendations according to the implemented configuration.

**Note:** Recommendations are intended for environmental awareness and travel planning. They are not medical advice and should not be treated as a guarantee of health or safety.

### 4. Environmental and Weather Information

The application integrates environmental information from supported data sources, which may include:

- Air Quality Index
- PM2.5 and PM10
- Other supported air pollutants
- Temperature and humidity
- Weather conditions
- UV index, where available

The exact data displayed depends on source availability, location coverage, and API configuration.

### 5. Interactive Map

- Displays map and route information through the configured mapping service.
- Supports location-based journey planning.
- Presents route information and pollution-related insights where data is available.

### 6. User Profiles and Journey History

The backend and MongoDB integration support user-related application data, including profile information and journey history.

Saved places and other personalized features should be used only where the corresponding functionality is enabled in the deployed application.

### 7. Progressive Web App

The frontend includes PWA-related configuration and assets. Installation and offline capabilities depend on the deployed manifest, service worker, browser support, and caching configuration.

## Technology Stack

The following technologies are documented in the project materials. Check the current dependency files for the exact installed versions.

| Component          | Technologies                            |
| ------------------ | --------------------------------------- |
| Frontend           | React, Vite, JavaScript                 |
| Styling            | Tailwind CSS                            |
| Backend            | Python, Flask                           |
| Machine Learning   | TensorFlow, Keras                       |
| Data Processing    | NumPy, Pandas, scikit-learn             |
| Database           | MongoDB, PyMongo                        |
| Mapping            | Google Maps Platform                    |
| Environmental Data | Open-Meteo and other configured sources |
| Traffic            | TomTom, where configured                |
| Conversational AI  | xAI API, where configured               |
| Frontend Hosting   | Vercel                                  |

## Machine Learning Approach

AeroMobilityAI uses a time-series forecasting approach to predict future AQI values from historical environmental observations.

### Forecasting Workflow

1. Load historical air quality and associated environmental data.
2. Organize observations by timestamp and station.
3. Prepare and engineer the model input features.
4. Apply the preprocessing transformations expected by the trained model.
5. Construct a sequence of 72 historical hourly steps.
6. Pass the sequence to the trained GRU model.
7. Generate a forecast covering the next 24 hours.
8. Transform predictions back to the appropriate AQI scale for downstream display and analysis.

### Model Configuration

| Parameter               | Description                                         |
| ----------------------- | --------------------------------------------------- |
| Model architecture      | GRU (Gated Recurrent Unit)                          |
| Historical input window | 72 hours                                            |
| Forecast horizon        | 24 hours                                            |
| Feature count           | 65 engineered features, as documented for the model |
| Framework               | TensorFlow/Keras                                    |
| Preprocessing           | Saved feature and target scalers                    |
| Prediction output       | Hourly AQI forecast                                 |

### Model Artifacts

The project documentation identifies the following model-related artifacts:

- `aqi_gru_24h_current.keras` — trained forecasting model
- `feature_scaler.joblib` — feature preprocessing scaler
- `target_scaler.joblib` — target preprocessing scaler
- `feature_columns.json` — expected feature ordering
- `model_config.json` — model configuration metadata
- `stations.json` — station metadata

Their availability depends on the files included in the actual repository and deployment.

### Model Evaluation

The earlier project documentation reports the following evaluation metrics:

| Metric                         | Reported Value |
| ------------------------------ | -------------: |
| Mean Absolute Error (MAE)      |          35.32 |
| Root Mean Squared Error (RMSE) |          49.43 |
| R² Score                       |          0.863 |

These figures are reported project results, not independently verified performance guarantees. Before presenting them as final results, confirm that they correspond to the current model and a documented held-out evaluation dataset.

AQI forecast errors should be interpreted in the context of the target scale, data quality, station coverage, and evaluation methodology.

## System Architecture

AeroMobilityAI follows a frontend-backend architecture.

```text
                 USER
                   |
                   v
       React + Vite Frontend
       - Journey Planner
       - Interactive Map
       - AQI Forecast Display
       - User Profile and History
                   |
                   | HTTP / REST API
                   v
             Flask Backend
                   |
          +--------+---------+
          |        |         |
          v        v         v
       AQI/ML    Route      Chat
      Prediction Analysis   Service
          |        |         |
          +--------+---------+
                   |
          External Data APIs
          - Mapping and Routes
          - Weather and AQI
          - Traffic, where configured
          - AI Service, where configured
                   |
                   v
                MongoDB
          - User-related data
          - Journey history
          - Other supported records
```

The actual communication flow and available services depend on the current backend implementation and deployment configuration.

### Example: Route Recommendation Workflow

1. The user enters journey details and selects a health profile.
2. The frontend sends the required request to the backend.
3. The backend obtains route information from the configured mapping service.
4. Environmental information is retrieved for the relevant locations when available.
5. The route-scoring logic evaluates available pollution and travel-related information.
6. The application returns route details and recommendations.
7. The frontend presents the results for comparison.
8. Journey details may be stored in MongoDB when history persistence is enabled.

## Project Structure

The following is a simplified representation of the documented repository layout. Some files may differ in the current version.

```text
aero_mobility/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── db.py
│   ├── config/
│   ├── models/
│   │   └── aqi_model/
│   ├── routes/
│   │   ├── aqi_routes.py
│   │   ├── route_routes.py
│   │   ├── history_routes.py
│   │   ├── auth_routes.py
│   │   ├── chat_routes.py
│   │   └── places_routes.py
│   ├── services/
│   ├── utils/
│   └── data/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── AeroChat.jsx
│       ├── AuthGate.jsx
│       ├── aqiVisuals.js
│       └── components/
│
├── .gitignore
└── README.md
```

Refer to the actual repository for the complete and current directory structure.

## Prerequisites

For local development, you may need:

- Python compatible with the backend dependencies.
- Node.js and npm compatible with the frontend.
- MongoDB locally or a MongoDB Atlas database.
- Required external API credentials for the features you intend to run.
- The model artifacts and supporting preprocessing files required for AQI prediction.

Check `backend/requirements.txt` and `frontend/package.json` before selecting runtime versions.

## Installation and Setup

### 1. Clone the Repository

Replace the repository URL with the actual GitHub URL.

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd aero_mobility
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
venv\Scripts\activate
```

On macOS or Linux:

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure the backend environment variables according to the requirements of the existing code.

Start the backend using the entry point and command supported by the repository. If the Flask application is configured for direct execution, the command may be:

```bash
python app.py
```

The default local address may be `http://localhost:5000`; confirm the actual host and port in the backend configuration.

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Configure the frontend environment according to the existing Vite configuration.

Start the development server:

```bash
npm run dev
```

Vite commonly serves local applications at `http://localhost:5173`, unless the configuration or available port changes.

### 4. Verify the Application

- Open the local frontend URL.
- Confirm that the backend is running and reachable.
- Test registration and login if configured.
- Check whether the map loads.
- Test AQI forecasting and route recommendations.
- Confirm that journey history is stored and retrieved as expected.

Some features require valid external API credentials, a reachable database, and compatible machine learning dependencies.

## Environment Configuration

The backend and frontend may require different environment variables. Consult the actual application configuration to identify which ones are required.

Possible backend variable names documented for this project include:

| Variable              | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `MONGODB_URI`         | MongoDB connection string                   |
| `GOOGLE_MAPS_API_KEY` | Server-side mapping requests, if used       |
| `TOMTOM_API_KEY`      | Traffic API access, if configured           |
| `XAI_API_KEY`         | Conversational AI integration, if enabled   |
| `XAI_MODEL`           | Configured AI model, if supported           |
| `SERPAPI_KEY`         | Optional search integration, if implemented |

The frontend may use:

| Variable                   | Purpose                              |
| -------------------------- | ------------------------------------ |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser-side Google Maps integration |

These names are based on the project documentation. Confirm them against the current code before configuring the application.

### Important Security Notes

- Never commit actual `.env` files, passwords, database connection strings, or secret API keys.
- Never place server-side secrets in frontend environment variables.
- Vite variables prefixed with `VITE_` are included in client-side code and must be treated as public.
- Use a browser-restricted Google Maps key for browser-based mapping.
- Store backend secrets in the environment settings of the relevant hosting service.
- Do not share screenshots or logs that expose credentials.

This README does not require creating a new environment file.

## API Overview

The backend documentation describes the following endpoint groups. Confirm the current routes, HTTP methods, authentication requirements, and payload formats in the actual Flask code before relying on these examples.

| Endpoint                           | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `GET /api/health`                  | Backend health check                  |
| `POST /api/auth/register`          | User registration                     |
| `POST /api/auth/login`             | User login                            |
| `GET /api/aqi/stations`            | Station search                        |
| `GET /api/aqi/environment/current` | Current environmental data            |
| `GET /api/aqi/nearest`             | Nearest station information           |
| `GET /api/aqi/predict`             | AQI forecasting                       |
| `GET /api/routes/find`             | Route analysis and recommendations    |
| `GET /api/history`                 | Journey history retrieval             |
| `GET /api/history/{trip_id}`       | Retrieve a specific journey           |
| `DELETE /api/history/{trip_id}`    | Delete a journey                      |
| `DELETE /api/history`              | Clear journey history                 |
| `GET /api/places`                  | Retrieve saved places, if supported   |
| `POST /api/places`                 | Add a saved place, if supported       |
| `PUT /api/places/{place_id}`       | Update a saved place, if supported    |
| `DELETE /api/places/{place_id}`    | Delete a saved place, if supported    |
| `POST /api/chat`                   | Conversational AI request, if enabled |

### Example Request

A documented AQI forecast request may use the following format:

```http
GET /api/aqi/predict?station_id=STATION_ID
```

The response format depends on the implementation and may contain forecast timestamps, predicted AQI values, and status information.

For actual request and response schemas, refer to the corresponding Flask route handlers and service implementations.

## Deployment

### Frontend: Vercel

The frontend is deployed on Vercel.

The existing Vercel project configuration should be preserved. Do not change its root directory, build settings, environment variables, or deployment configuration merely to update this documentation.

For a Vite frontend, common build settings are:

| Setting          | Typical Value   |
| ---------------- | --------------- |
| Framework        | Vite            |
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Install command  | `npm install`   |

Use the settings already configured in your Vercel project if they differ from these defaults.

### Backend: Flask

The Flask backend requires a compatible Python runtime and access to any required model artifacts, database, and external APIs.

If the backend is hosted separately, configure the frontend to use the actual deployed backend URL. A frontend deployed on Vercel cannot access a developer's local `127.0.0.1:5000` backend from a recruiter's device.

TensorFlow/Keras compatibility, model size, startup time, and serverless execution limits should be evaluated before choosing a backend hosting platform.

**Deployment status:** A public frontend URL does not, by itself, confirm that every backend-dependent feature is working online. Verify authentication, predictions, route recommendations, and history on the live application.

## Database and Security

MongoDB is used for application data such as user-related information and journey history, depending on the enabled features.

### Recommended Practices

- Use authenticated database connections.
- Configure database access permissions appropriately.
- Validate and sanitize incoming user data.
- Hash passwords using a suitable password-hashing algorithm.
- Ensure users can access only their own private records.
- Avoid exposing detailed server errors to clients.
- Restrict cross-origin requests to the intended frontend domains in production.
- Monitor database storage, connections, and request volume.
- Avoid unnecessarily storing repeated journey records or sensitive location history.

Database capacity and connection limits depend on the selected MongoDB deployment and plan. Review the current provider limits rather than assuming that a free tier will support unlimited traffic.

## External APIs and Limitations

AeroMobilityAI depends on third-party services for some of its mapping, environmental, traffic, and conversational AI features.

| Service              | Intended Use                                   |
| -------------------- | ---------------------------------------------- |
| Google Maps Platform | Map display and route-related services         |
| Open-Meteo           | Weather and air-quality data, where configured |
| TomTom               | Traffic information, where configured          |
| xAI API              | Conversational AI, where enabled               |
| SerpAPI              | Optional search integration, where implemented |
| MongoDB              | Persistent application data                    |

### API Usage Considerations

- API access may require credentials, billing, or account activation.
- Providers can impose usage quotas, rate limits, licensing terms, and other restrictions.
- Pricing and free-tier allowances can change.
- A successful frontend deployment does not guarantee that third-party APIs are available.
- Missing credentials, exhausted quotas, network errors, or provider outages may cause individual features to fail.
- Use API-key restrictions and usage monitoring wherever supported.

Check the official provider documentation for current pricing, usage limits, and service conditions.

## Progressive Web App

The project includes PWA-related assets and configuration.

Where supported by the deployed build, a PWA can be installed from a compatible browser and may provide an app-like interface.

### Installation

**Desktop**

1. Open the deployed website in a compatible browser.
2. Look for the browser's install option when available.
3. Follow the browser instructions to install the application.

**Android**

1. Open the website in a compatible browser.
2. Open the browser menu.
3. Select the install or Add to Home screen option if available.

**iOS**

1. Open the website in Safari.
2. Open the Share menu.
3. Select Add to Home Screen if available.

### Offline Behavior

Offline functionality depends on the service worker and caching strategy actually configured in the project. Cached interface assets do not necessarily mean that live maps, AQI predictions, authentication, or route recommendations will work without an internet connection.

## Troubleshooting

### The Map Does Not Load

- Verify that the browser-side API key is configured correctly.
- Check that the required mapping APIs are enabled.
- Confirm that key restrictions permit the deployed website's domain.
- Inspect the browser console for API errors.
- Check the provider's quota and billing status.

### AQI Forecasting Fails

- Verify that the required model artifacts are present.
- Check the Python environment and TensorFlow/Keras compatibility.
- Confirm that the input features match the expected feature order and shape.
- Check backend logs for model-loading or prediction errors.

### MongoDB Connection Fails

- Check the configured connection string.
- Verify database credentials and network access.
- Confirm that the database deployment is available.
- Check backend logs without exposing credentials.

### Frontend Loads but Backend Features Fail

- Confirm that the Flask backend is deployed and reachable.
- Verify the configured API base URL.
- Check CORS configuration.
- Inspect browser network requests and backend logs.
- Confirm that the deployed backend has all required environment variables.

### AI Assistant Does Not Respond

- Verify the AI provider configuration if the feature is enabled.
- Check API access, quotas, and provider availability.
- Review backend logs for relevant errors without sharing secret values.

## Future Enhancements

Potential future improvements include:

- More comprehensive AQI forecast evaluation and model experimentation.
- Improved handling of missing or delayed environmental data.
- Caching and optimization for frequently requested data.
- Enhanced monitoring and error reporting.
- Expanded route comparison and environmental insights.
- Additional accessibility and usability improvements.
- More comprehensive automated testing.
- Further PWA improvements, where appropriate.

These are potential enhancements and should not be interpreted as currently implemented features.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes.
4. Test your changes.
5. Submit a pull request describing the improvements.

Please avoid committing credentials, private data, or local environment files.

## License

Add the project's actual license information here.

If the repository contains a `LICENSE` file, refer to that file and ensure the license named here matches it. Do not assume a license applies merely because it was mentioned in an earlier draft.

## Author

**Pallavi Verulkar**

- GitHub: [Pallavi960](https://github.com/Pallavi960)

## Acknowledgments

AeroMobilityAI builds on open-source software and external data services. Acknowledgments include the relevant contributors and providers whose tools and datasets are used in the actual implementation.

## Project Status

**Project:** AeroMobilityAI
**Focus:** Machine learning, environmental intelligence, and smart mobility
**Frontend hosting:** Vercel
**Development status:** Refer to the current repository and live application for the latest status.

---

*Built to explore how AI and environmental data can contribute to healthier, more informed urban mobility decisions.*
