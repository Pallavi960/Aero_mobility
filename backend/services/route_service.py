import requests
import polyline

from config.settings import (
    GOOGLE_MAPS_API_KEY,
    MAX_ROUTES,
    REQUEST_TIMEOUT_SECONDS,
)

from services.traffic_service import (
    duration_to_seconds,
    calculate_traffic,
)


GOOGLE_ROUTES_URL = (
    "https://routes.googleapis.com/directions/v2:computeRoutes"
)

# Route requests must reach Google directly.  Some local development tools add
# HTTP(S)_PROXY variables that point at a temporary localhost proxy; requests
# otherwise inherits those values and every Routes API call fails before it
# leaves the machine.
google_routes_session = requests.Session()
google_routes_session.trust_env = False


def _sample_route_points(encoded_polyline, max_points=10):
    """
    Decode Google's encoded polyline and select
    evenly distributed points along the route.
    """

    if not encoded_polyline:
        return []

    try:
        points = polyline.decode(encoded_polyline)

    except Exception:
        return []

    if not points:
        return []

    if len(points) <= max_points:
        selected_points = points

    else:
        indexes = [
            round(
                i * (len(points) - 1) / (max_points - 1)
            )
            for i in range(max_points)
        ]

        selected_points = [
            points[index]
            for index in indexes
        ]

    return [
        {
            "latitude": round(
                float(latitude),
                6
            ),
            "longitude": round(
                float(longitude),
                6
            ),
        }
        for latitude, longitude in selected_points
    ]


def get_routes(
    origin_latitude,
    origin_longitude,
    destination_latitude,
    destination_longitude,
):
    """
    Get up to three unique traffic-aware routes from Google Routes API.

    Each profile is evaluated independently later by the existing AQI/GRU
    pipeline: fastest, avoid tolls, and avoid highways.
    """

    if not GOOGLE_MAPS_API_KEY:
        return {
            "success": False,
            "error": "Google Maps API key is not configured.",
        }

    headers = {
        "Content-Type": "application/json",

        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,

        "X-Goog-FieldMask": (
            "routes.distanceMeters,"
            "routes.duration,"
            "routes.staticDuration,"
            "routes.polyline.encodedPolyline"
        ),
    }

    payload = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": float(origin_latitude),
                    "longitude": float(origin_longitude),
                }
            }
        },

        "destination": {
            "location": {
                "latLng": {
                    "latitude": float(destination_latitude),
                    "longitude": float(destination_longitude),
                }
            }
        },

        "travelMode": "DRIVE",

        # Use Google's real-time traffic-aware routing.
        "routingPreference": "TRAFFIC_AWARE",

        # Ask Google for alternatives as well. Some route modifiers can resolve
        # to the same road geometry, so alternatives give us more chances to
        # present genuinely different paths on the map.
        "computeAlternativeRoutes": True,

        "languageCode": "en-US",

        "units": "METRIC",
    }

    route_profiles = (
        ("Fastest", {}),
        ("Avoid tolls", {"avoidTolls": True}),
        ("Avoid highways", {"avoidHighways": True}),
    )
    google_routes = []
    alternative_routes = []
    seen_polylines = set()
    request_errors = []

    for route_type, modifiers in route_profiles:
        profile_payload = payload.copy()
        if modifiers:
            profile_payload["routeModifiers"] = modifiers

        try:
            response = google_routes_session.post(
                GOOGLE_ROUTES_URL,
                headers=headers,
                json=profile_payload,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            profile_routes = response.json().get("routes", [])
        except requests.RequestException as error:
            request_errors.append(f"{route_type}: {str(error)}")
            continue

        if not profile_routes:
            continue

        primary_route = profile_routes[0]
        primary_polyline = (
            primary_route
            .get("polyline", {})
            .get("encodedPolyline")
        )

        # Do not return cards that would draw directly on top of each other.
        if primary_polyline and primary_polyline not in seen_polylines:
            seen_polylines.add(primary_polyline)
            google_routes.append({
                "route_type": route_type,
                "route": primary_route,
            })

        for alternative_index, alternative_route in enumerate(
            profile_routes[1:],
            start=1,
        ):
            alternative_routes.append({
                "route_type": f"{route_type} alternative {alternative_index}",
                "route": alternative_route,
            })

    # Retain the preferred primary route for each profile first, then fill any
    # remaining slots with unique Google alternatives.
    for alternative in alternative_routes:
        if len(google_routes) >= MAX_ROUTES:
            break

        alternative_polyline = (
            alternative["route"]
            .get("polyline", {})
            .get("encodedPolyline")
        )

        if not alternative_polyline or alternative_polyline in seen_polylines:
            continue

        seen_polylines.add(alternative_polyline)
        google_routes.append(alternative)

    if not google_routes:

        return {
            "success": False,
            "error": (
                "Google Routes API returned no routes. "
                + " ".join(request_errors)
            ).strip(),
        }

    routes = []

    for index, route_profile in enumerate(google_routes[:MAX_ROUTES]):
        route = route_profile["route"]

        # =================================================
        # TRAVEL TIME
        # =================================================

        duration_seconds = duration_to_seconds(
            route.get("duration", "0s")
        )

        # Travel time without traffic.
        static_duration_seconds = duration_to_seconds(
            route.get("staticDuration", "0s")
        )

        # =================================================
        # TRAFFIC
        # =================================================

        traffic = calculate_traffic(
            duration_seconds,
            static_duration_seconds,
        )

        # =================================================
        # DISTANCE
        # =================================================

        distance_meters = route.get(
            "distanceMeters",
            0,
        )

        distance_km = (
            distance_meters / 1000
        )

        # =================================================
        # POLYLINE
        # =================================================

        encoded_polyline = (
            route
            .get("polyline", {})
            .get("encodedPolyline")
        )

        # =================================================
        # ROUTE POINTS
        # =================================================

        route_points = _sample_route_points(
            encoded_polyline,
            max_points=10,
        )

        # =================================================
        # ROUTE RESULT
        # =================================================

        routes.append({

            "route_id": f"{index + 1} - {route_profile['route_type']}",

            "route_type": route_profile["route_type"],

            # Distance
            "distance_km": round(
                distance_km,
                2,
            ),

            # Current traffic-aware travel time
            "duration_minutes": round(
                duration_seconds / 60,
                1,
            ),

            "duration_in_traffic_minutes": round(
                duration_seconds / 60,
                1,
            ),

            # Travel time without traffic
            "static_duration_minutes": round(
                static_duration_seconds / 60,
                1,
            ),

            # Traffic delay
            "traffic_delay_minutes": traffic[
                "traffic_delay_minutes"
            ],

            # Relative traffic increase
            "traffic_ratio": traffic[
                "traffic_ratio"
            ],

            # Traffic condition
            "traffic_level": traffic[
                "traffic_level"
            ],

            # Google encoded route
            "polyline": encoded_polyline,

            # Sampled coordinates
            "route_points": route_points,
        })

    return {
        "success": True,
        "routes": routes,
    }
