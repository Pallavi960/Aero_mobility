from flask import Blueprint, request, jsonify

from services.gps_service import validate_location
from services.route_service import get_routes
from services.route_aqi_service import get_route_aqi
from services.scoring_service import HEALTH_PROFILES, rank_routes


route_bp = Blueprint(
    "route_bp",
    __name__,
    url_prefix="/api/routes"
)


@route_bp.route("/find", methods=["GET"])
def find_routes():

    origin_lat = request.args.get("origin_lat")
    origin_lng = request.args.get("origin_lng")
    destination_lat = request.args.get("destination_lat")
    destination_lng = request.args.get("destination_lng")
    health_profile = str(
        request.args.get("health_profile", "general")
    ).strip().lower()

    if health_profile not in HEALTH_PROFILES:
        return jsonify({
            "success": False,
            "error": "Unsupported health profile.",
            "allowed_health_profiles": list(HEALTH_PROFILES.keys()),
        }), 400

    if not all([
        origin_lat,
        origin_lng,
        destination_lat,
        destination_lng
    ]):
        return jsonify({
            "success": False,
            "error": "Origin and destination coordinates are required."
        }), 400

    origin = validate_location(
        origin_lat,
        origin_lng
    )

    destination = validate_location(
        destination_lat,
        destination_lng
    )

    if not origin["success"]:
        return jsonify(origin), 400

    if not destination["success"]:
        return jsonify(destination), 400

    # 1. Get routes from Google
    result = get_routes(
        origin["latitude"],
        origin["longitude"],
        destination["latitude"],
        destination["longitude"]
    )

    if not result["success"]:
        return jsonify(result), 500

    # 2. Calculate predicted AQI for every route
    for route in result["routes"]:

        route_aqi = get_route_aqi(
            route.get("route_points", [])
        )

        if route_aqi["success"]:

            route["aqi"] = {
                "average_aqi": route_aqi["average_aqi"],
                "maximum_aqi": route_aqi["maximum_aqi"],
                "aqi_category": route_aqi["aqi_category"],
                "worst_point": route_aqi["worst_point"],
                "points_evaluated": route_aqi["points_evaluated"]
            }

        else:

            route["aqi"] = {
                "average_aqi": None,
                "maximum_aqi": None,
                "aqi_category": "Unavailable",
                "error": route_aqi["error"]
            }

    # 3. Rank routes
    ranking_result = rank_routes(
        result["routes"],
        health_profile,
    )

    if not ranking_result["success"]:
        return jsonify({
            "success": False,
            "error": ranking_result["error"]
        }), 500

    return jsonify({
        "success": True,
        "recommended_route_id": ranking_result[
            "recommended_route_id"
        ],
        "health_profile": ranking_result["health_profile"],
        "health_profile_key": ranking_result["health_profile_key"],
        "scoring_weights": ranking_result["scoring_weights"],
        "routes": ranking_result["routes"]
    }), 200
