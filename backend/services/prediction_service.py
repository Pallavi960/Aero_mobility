import json
from functools import lru_cache

import joblib
import numpy as np
import pandas as pd

try:
    import tensorflow as tf
    from keras.initializers import GlorotUniform
    from keras.layers import Dense

    @classmethod
    def _compatible_glorot_from_config(cls, config):
        config = dict(config)
        config.pop("input_axes", None)
        config.pop("output_axes", None)
        return cls(**config)

    GlorotUniform.from_config = _compatible_glorot_from_config

    _original_dense_from_config = Dense.from_config

    @classmethod
    def _compatible_dense_from_config(cls, config):
        config = dict(config)
        config.pop("quantization_config", None)
        return _original_dense_from_config(config)

    Dense.from_config = _compatible_dense_from_config
    TF_AVAILABLE = True
except Exception:
    tf = None
    TF_AVAILABLE = False


# =========================================================
# LOAD MODEL AND PREPROCESSING RESOURCES
# =========================================================

@lru_cache(maxsize=1)
def load_prediction_resources():
    """
    Load the trained GRU model, scalers and feature
    configuration only once.
    """

    model = tf.keras.models.load_model(
        MODEL_PATH,
        compile=False
    )

    with open(
        FEATURE_COLUMNS_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        feature_columns = json.load(file)

    feature_scaler = joblib.load(
        FEATURE_SCALER_PATH
    )

    target_scaler = joblib.load(
        TARGET_SCALER_PATH
    )

    with open(
        MODEL_CONFIG_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        model_config = json.load(file)

    return (
        model,
        feature_columns,
        feature_scaler,
        target_scaler,
        model_config
    )


# =========================================================
# LOAD AQI DATASET
# =========================================================

@lru_cache(maxsize=1)
def load_prediction_data():
    """
    Load the historical AQI dataset used to prepare
    the latest 72-hour sequence.
    """

    df = pd.read_csv(
        AQI_DATA_PATH
    )

    df["Datetime"] = pd.to_datetime(
        df["Datetime"],
        errors="coerce"
    )

    df = df.sort_values(
        ["StationId", "Datetime"]
    ).reset_index(drop=True)

    return df


# =========================================================
# CREATE TIME FEATURES
# =========================================================

def create_time_features(df):
    """
    Create the same cyclical time features used during
    model training.
    """

    df = df.copy()

    # Basic time features
    df["hour"] = df["Datetime"].dt.hour
    df["day_of_week"] = df["Datetime"].dt.dayofweek
    df["month"] = df["Datetime"].dt.month

    # Hour cycle
    df["hour_sin"] = np.sin(
        2 * np.pi * df["hour"] / 24
    )

    df["hour_cos"] = np.cos(
        2 * np.pi * df["hour"] / 24
    )

    # Day cycle
    df["day_sin"] = np.sin(
        2 * np.pi * df["day_of_week"] / 7
    )

    df["day_cos"] = np.cos(
        2 * np.pi * df["day_of_week"] / 7
    )

    # Month cycle
    df["month_sin"] = np.sin(
        2 * np.pi * df["month"] / 12
    )

    df["month_cos"] = np.cos(
        2 * np.pi * df["month"] / 12
    )

    # Wind direction cycle
    if "Wind (From) Direction (Degrees)" in df.columns:

        wind_direction = pd.to_numeric(
            df["Wind (From) Direction (Degrees)"],
            errors="coerce"
        ).fillna(0)

        df["wind_dir_sin"] = np.sin(
            np.deg2rad(wind_direction)
        )

        df["wind_dir_cos"] = np.cos(
            np.deg2rad(wind_direction)
        )

    return df


# =========================================================
# PREPARE MODEL FEATURES
# =========================================================

def prepare_features(
    station_data,
    feature_columns
):
    """
    Prepare the 72-hour input sequence.

    The final feature order is forced to match the
    feature order used during model training.
    """

    df = create_time_features(
        station_data
    )

    # -----------------------------------------------------
    # One-hot encode categorical columns
    # -----------------------------------------------------

    df = pd.get_dummies(
        df,
        columns=[
            "Weather Condition",
            "StationId"
        ],
        dtype=float
    )

    # -----------------------------------------------------
    # Remove columns that were not model input features
    # -----------------------------------------------------

    columns_to_remove = [
        "Datetime",
        "AQI",
        "AQI_Bucket",
        "StationName",
        "City",
        "State"
    ]

    df = df.drop(
        columns=[
            column
            for column in columns_to_remove
            if column in df.columns
        ],
        errors="ignore"
    )

    # -----------------------------------------------------
    # Add any missing training columns
    # -----------------------------------------------------

    for column in feature_columns:

        if column not in df.columns:
            df[column] = 0.0

    # -----------------------------------------------------
    # Keep EXACT training feature order
    # -----------------------------------------------------

    df = df[
        feature_columns
    ]

    # -----------------------------------------------------
    # Convert everything to numeric
    # -----------------------------------------------------

    df = df.apply(
        pd.to_numeric,
        errors="coerce"
    )

    # -----------------------------------------------------
    # Remove infinite values
    # -----------------------------------------------------

    df = df.replace(
        [np.inf, -np.inf],
        np.nan
    )

    # -----------------------------------------------------
    # Fill missing values
    # -----------------------------------------------------

    df = df.ffill().bfill()

    return df


# =========================================================
# PREDICT NEXT 24 HOURS
# =========================================================

def predict_next_24_hours(
    station_id
):
    """
    Generate a 24-hour AQI forecast for a monitoring
    station using the trained GRU model.
    """
    if not TF_AVAILABLE:
        return {
            "success": False,
            "error": "AQI prediction model unavailable in this deployment."
        }

    # -----------------------------------------------------
    # Load model and preprocessing resources
    # -----------------------------------------------------

    (
        model,
        feature_columns,
        feature_scaler,
        target_scaler,
        model_config
    ) = load_prediction_resources()

    # -----------------------------------------------------
    # Load historical data
    # -----------------------------------------------------

    df = load_prediction_data()

    # -----------------------------------------------------
    # Select requested station
    # -----------------------------------------------------

    station_data = df[
        df["StationId"].astype(str).str.strip().str.lower() == str(station_id).strip().lower()
    ].copy()

    if station_data.empty:
        # Try finding by substring or first available station
        available = df["StationId"].dropna().unique()
        matched = [sid for sid in available if str(station_id).lower() in str(sid).lower() or str(sid).lower() in str(station_id).lower()]
        fallback_id = matched[0] if matched else (available[0] if len(available) > 0 else None)
        if fallback_id is not None:
            station_data = df[df["StationId"] == fallback_id].copy()
            station_id = fallback_id

    if station_data.empty:
        return {
            "success": False,
            "error": f"Station {station_id} not found."
        }

    station_data = station_data.sort_values(
        "Datetime"
    )

    # -----------------------------------------------------
    # Check whether 72 hours are available
    # -----------------------------------------------------

    if len(station_data) < HISTORY_HOURS:

        return {
            "success": False,
            "error": (
                f"Station {station_id} does not have "
                f"enough historical data for prediction."
            )
        }

    # -----------------------------------------------------
    # Take latest 72 hours
    # -----------------------------------------------------

    history = station_data.tail(
        HISTORY_HOURS
    ).copy()

    # -----------------------------------------------------
    # Prepare features
    # -----------------------------------------------------

    features = prepare_features(
        history,
        feature_columns
    )

    if len(features) != HISTORY_HOURS:

        return {
            "success": False,
            "error": (
                "Unable to create the 72-hour "
                "feature sequence."
            )
        }

    # -----------------------------------------------------
    # Scale features and make prediction
    # -----------------------------------------------------

    try:

        scaled_features = feature_scaler.transform(
            features
        )

        # Model input shape:
        # (batch_size, 72, 65)

        model_input = np.expand_dims(
            scaled_features,
            axis=0
        )

        # Generate 24-hour prediction

        prediction_scaled = model.predict(
            model_input,
            verbose=0
        )

        # Convert scaled AQI back to original AQI

        prediction = target_scaler.inverse_transform(
            prediction_scaled
        )[0]

    except Exception as error:

        return {
            "success": False,
            "error": f"Prediction failed: {str(error)}"
        }

    # -----------------------------------------------------
    # AQI cannot be negative
    # -----------------------------------------------------

    prediction = np.maximum(
        prediction,
        0
    )

    # -----------------------------------------------------
    # Generate forecast timestamps
    # -----------------------------------------------------

    last_datetime = history[
        "Datetime"
    ].iloc[-1]

    forecast_times = pd.date_range(
        start=last_datetime + pd.Timedelta(hours=1),
        periods=FORECAST_HOURS,
        freq="h"
    )

    # -----------------------------------------------------
    # Build forecast response
    # -----------------------------------------------------

    forecast = []

    for timestamp, aqi in zip(
        forecast_times,
        prediction
    ):

        forecast.append({
            "datetime": timestamp.isoformat(),
            "predicted_aqi": round(
                float(aqi),
                2
            )
        })

    # -----------------------------------------------------
    # Return final result
    # -----------------------------------------------------

    return {
        "success": True,
        "station_id": station_id,
        "history_hours": HISTORY_HOURS,
        "forecast_hours": FORECAST_HOURS,
        "last_historical_datetime": (
            last_datetime.isoformat()
        ),
        "forecast": forecast
    }