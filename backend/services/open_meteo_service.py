"""Fetch and normalize live, modeled environmental data from Open-Meteo.

This service is deliberately independent of the existing station-data and GRU
prediction services.  The data it returns is ready for a later integration,
but it does not change how routes are currently scored or predicted.
"""

import json
import logging

import requests

from config.settings import REQUEST_TIMEOUT_SECONDS
from utils.helpers import validate_coordinates


logger = logging.getLogger(__name__)

OPEN_METEO_AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

AIR_QUALITY_CURRENT_FIELDS = [
    "pm2_5",
    "pm10",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "sulphur_dioxide",
    "ozone",
    "ammonia",
    "nitrogen_monoxide",
    "us_aqi",
    "european_aqi",
]

WEATHER_CURRENT_FIELDS = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "wind_speed_10m",
    "wind_direction_10m",
    "pressure_msl",
    "weather_code",
]


def _request_current_data(url, latitude, longitude, fields, source_name):
    """Request one Open-Meteo current-data endpoint and log its raw JSON."""
    try:
        response = requests.get(
            url,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": ",".join(fields),
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.Timeout:
        return {"success": False, "error": f"{source_name} request timed out."}
    except requests.RequestException as error:
        return {
            "success": False,
            "error": f"{source_name} request failed: {str(error)}",
        }
    except ValueError:
        return {
            "success": False,
            "error": f"{source_name} returned invalid JSON.",
        }

    # Intentionally log the unmodified response during live-data verification.
    logger.info("Open-Meteo %s raw response: %s", source_name, json.dumps(payload))

    if not isinstance(payload.get("current"), dict):
        return {
            "success": False,
            "error": f"{source_name} response did not include current data.",
        }

    return {"success": True, "payload": payload}


def get_current_environmental_data(latitude, longitude):
    """Return one normalized Open-Meteo air-quality and weather data object."""
    valid, latitude, longitude = validate_coordinates(latitude, longitude)
    if not valid:
        return {
            "success": False,
            "error": "Invalid latitude or longitude.",
        }

    air_quality_result = _request_current_data(
        OPEN_METEO_AIR_QUALITY_URL,
        latitude,
        longitude,
        AIR_QUALITY_CURRENT_FIELDS,
        "Air Quality API",
    )
    if not air_quality_result["success"]:
        return air_quality_result

    weather_result = _request_current_data(
        OPEN_METEO_WEATHER_URL,
        latitude,
        longitude,
        WEATHER_CURRENT_FIELDS,
        "Weather API",
    )
    if not weather_result["success"]:
        return weather_result

    air_payload = air_quality_result["payload"]
    weather_payload = weather_result["payload"]
    air_current = air_payload["current"]
    weather_current = weather_payload["current"]

    # Fields are passed through as null when unavailable; values are never invented.
    environmental_data = {
        "location": {"latitude": latitude, "longitude": longitude},
        "data_type": "Open-Meteo modeled air-quality and weather data, not government monitoring-station measurements.",
        "air_quality": {
            "source": "Open-Meteo Air Quality API (modeled)",
            "time": air_current.get("time"),
            "pm2_5": air_current.get("pm2_5"),
            "pm10": air_current.get("pm10"),
            "carbon_monoxide": air_current.get("carbon_monoxide"),
            "nitrogen_dioxide": air_current.get("nitrogen_dioxide"),
            "sulphur_dioxide": air_current.get("sulphur_dioxide"),
            "ozone": air_current.get("ozone"),
            "ammonia": air_current.get("ammonia"),
            "nitrogen_monoxide": air_current.get("nitrogen_monoxide"),
            "us_aqi": air_current.get("us_aqi"),
            "european_aqi": air_current.get("european_aqi"),
            "units": air_payload.get("current_units", {}),
        },
        "weather": {
            "source": "Open-Meteo Weather API",
            "time": weather_current.get("time"),
            "temperature_2m": weather_current.get("temperature_2m"),
            "relative_humidity_2m": weather_current.get("relative_humidity_2m"),
            "dew_point_2m": weather_current.get("dew_point_2m"),
            "wind_speed_10m": weather_current.get("wind_speed_10m"),
            "wind_direction_10m": weather_current.get("wind_direction_10m"),
            "pressure_msl": weather_current.get("pressure_msl"),
            "weather_code": weather_current.get("weather_code"),
            "units": weather_payload.get("current_units", {}),
        },
        "prediction_pipeline_status": "Ready for future integration; existing GRU prediction remains unchanged.",
    }

    logger.info("Combined Open-Meteo environmental data: %s", json.dumps(environmental_data))
    return {"success": True, "environmental_data": environmental_data}
