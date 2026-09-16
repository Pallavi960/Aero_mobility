from services.aqi_service import get_nearest_station_aqi
from services.prediction_service import predict_next_24_hours


def get_route_aqi(route_points):
    """
    Calculate predicted AQI information for points along a route.

    Each route point is matched with the nearest monitoring station.
    The station's GRU 24-hour AQI forecast is then used.
    """

    if not route_points:
        return {
            "success": False,
            "error": "No route points provided."
        }

    point_results = []

    for index, point in enumerate(route_points):

        latitude = point.get("latitude")
        longitude = point.get("longitude")

        if latitude is None or longitude is None:
            continue

        # Find nearest monitoring station
        station_result = get_nearest_station_aqi(
            latitude,
            longitude
        )

        if not station_result["success"]:
            continue

        station_id = station_result["station"]["station_id"]

        # Get next 24-hour GRU prediction
        prediction_result = predict_next_24_hours(
            station_id
        )

        if not prediction_result["success"]:
            continue

        predictions = prediction_result["forecast"]

        if not predictions:
            continue

        predicted_values = [
            item["predicted_aqi"]
            for item in predictions
        ]

        average_predicted_aqi = (
            sum(predicted_values) / len(predicted_values)
        )

        maximum_predicted_aqi = max(predicted_values)

        point_results.append({
            "point_index": index + 1,
            "latitude": latitude,
            "longitude": longitude,
            "station_id": station_id,
            "station_name": station_result["station"]["station_name"],
            "station_distance_km": station_result["station"]["distance_km"],
            "predicted_aqi": round(
                average_predicted_aqi,
                2
            ),
            "maximum_predicted_aqi": round(
                maximum_predicted_aqi,
                2
            ),
            "aqi_category": get_aqi_category_from_value(
                average_predicted_aqi
            )
        })

    if not point_results:
        return {
            "success": False,
            "error": "Unable to obtain predicted AQI for route points."
        }

    predicted_aqi_values = [
        point["predicted_aqi"]
        for point in point_results
    ]

    average_aqi = (
        sum(predicted_aqi_values)
        / len(predicted_aqi_values)
    )

    maximum_aqi = max(
        point["maximum_predicted_aqi"]
        for point in point_results
    )

    worst_point = max(
        point_results,
        key=lambda point: point["predicted_aqi"]
    )

    return {
        "success": True,
        "average_aqi": round(
            average_aqi,
            2
        ),
        "maximum_aqi": round(
            maximum_aqi,
            2
        ),
        "aqi_category": get_aqi_category_from_value(
            average_aqi
        ),
        "worst_point": worst_point,
        "points_evaluated": len(point_results),
        "points": point_results
    }


def get_aqi_category_from_value(aqi):
    """
    Convert AQI value into an AQI category.
    """

    if aqi <= 50:
        return "Good"

    if aqi <= 100:
        return "Satisfactory"

    if aqi <= 200:
        return "Moderate"

    if aqi <= 300:
        return "Poor"

    if aqi <= 400:
        return "Very Poor"

    return "Severe"