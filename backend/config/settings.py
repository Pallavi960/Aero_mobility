import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# =========================
# AQI MODEL
# =========================

MODEL_DIR = BASE_DIR / "models" / "aqi_model"

MODEL_PATH = MODEL_DIR / "aqi_gru_24h_current.keras"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.json"
FEATURE_SCALER_PATH = MODEL_DIR / "feature_scaler.joblib"
TARGET_SCALER_PATH = MODEL_DIR / "target_scaler.joblib"
MODEL_CONFIG_PATH = MODEL_DIR / "model_config.json"
STATIONS_PATH = MODEL_DIR / "stations.json"


# =========================
# DATA
# =========================

DATA_DIR = BASE_DIR / "data"

AQI_DATA_PATH = DATA_DIR / "cleaned_aqi_data.csv"


# =========================
# GOOGLE MAPS
# =========================

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

GOOGLE_DIRECTIONS_URL = (
    "https://maps.googleapis.com/maps/api/directions/json"
)

GOOGLE_DISTANCE_MATRIX_URL = (
    "https://maps.googleapis.com/maps/api/distancematrix/json"
)


# =========================
# MODEL SETTINGS
# =========================

HISTORY_HOURS = 72
FORECAST_HOURS = 24


# =========================
# ROUTE SETTINGS
# =========================

MAX_ROUTES = 3

REQUEST_TIMEOUT_SECONDS = 15