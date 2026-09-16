from flask import Blueprint, request, jsonify

from services.aqi_service import get_nearest_station_aqi, search_stations
from services.open_meteo_service import get_current_environmental_data
from services.prediction_service import predict_next_24_hours


aqi_bp = Blueprint(
    "aqi_bp",
    __name__,
    url_prefix="/api/aqi"
)


@aqi_bp.route("/stations", methods=["GET"])
def stations():
    """Search AQI monitoring stations for the route-planner dropdown."""
    query = request.args.get("query", "")
    try:
        limit = min(max(int(request.args.get("limit", 8)), 1), 20)
    except ValueError:
        limit = 8

    return jsonify({"success": True, "stations": search_stations(query, limit)}), 200


@aqi_bp.route("/environment/current", methods=["GET"])
def current_environment():
    """Fetch current modeled air quality and weather from Open-Meteo."""
    latitude = request.args.get("latitude")
    longitude = request.args.get("longitude")

    if latitude is None or longitude is None:
        return jsonify({
            "success": False,
            "error": "Latitude and longitude are required."
        }), 400

    result = get_current_environmental_data(latitude, longitude)
    if not result["success"]:
        status_code = 400 if result["error"] == "Invalid latitude or longitude." else 502
        return jsonify(result), status_code

    return jsonify(result), 200


# =========================================================
# Get nearest station AQI
# =========================================================

@aqi_bp.route("/nearest", methods=["GET"])
def nearest_aqi():

    latitude = request.args.get("latitude")
    longitude = request.args.get("longitude")

    if not latitude or not longitude:

        return jsonify({
            "success": False,
            "error": "Latitude and longitude are required."
        }), 400

    result = get_nearest_station_aqi(
        latitude,
        longitude
    )

    if not result["success"]:

        return jsonify(result), 400

    return jsonify(result), 200


# =========================================================
# Predict next 24 hours AQI
# =========================================================

@aqi_bp.route("/predict", methods=["GET"])
def predict_aqi():

    station_id = request.args.get("station_id")

    if not station_id:

        return jsonify({
            "success": False,
            "error": "Station ID is required."
        }), 400

    result = predict_next_24_hours(
        station_id
    )

    if not result["success"]:

        return jsonify(result), 400

    return jsonify(result), 200
