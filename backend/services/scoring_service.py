HEALTH_PROFILES = {
    "general": {
        "label": "General",
        "aqi_weight": 0.60,
        "time_weight": 0.25,
        "traffic_weight": 0.15,
        "peak_aqi_weight": 0.20,
    },
    "respiratory": {
        "label": "Asthma / Respiratory Sensitivity",
        "aqi_weight": 0.75,
        "time_weight": 0.15,
        "traffic_weight": 0.10,
        "peak_aqi_weight": 0.45,
    },
    "cardiovascular": {
        "label": "Cardiovascular Sensitivity",
        "aqi_weight": 0.70,
        "time_weight": 0.15,
        "traffic_weight": 0.15,
        "peak_aqi_weight": 0.35,
    },
    "elderly": {
        "label": "Elderly",
        "aqi_weight": 0.70,
        "time_weight": 0.20,
        "traffic_weight": 0.10,
        "peak_aqi_weight": 0.35,
    },
    "child": {
        "label": "Child",
        "aqi_weight": 0.75,
        "time_weight": 0.15,
        "traffic_weight": 0.10,
        "peak_aqi_weight": 0.40,
    },
}


def get_health_profile(health_profile):
    """Return the normalized profile key and its scoring configuration."""

    profile_key = str(health_profile or "general").strip().lower()
    return profile_key, HEALTH_PROFILES.get(profile_key)


def calculate_route_score(route, profile):
    """
    Calculate the overall score for a route.

    Lower score = better route.

    The balance of pollution, travel time, traffic, and peak pollution is
    supplied by the selected health profile.
    """

    aqi_data = route.get("aqi", {})

    average_aqi = aqi_data.get(
        "average_aqi"
    )

    maximum_aqi = aqi_data.get("maximum_aqi", average_aqi)

    travel_time = route.get(
        "duration_in_traffic_minutes"
    )

    traffic_ratio = route.get(
        "traffic_ratio",
        0
    )

    if average_aqi is None:
        return {
            "success": False,
            "error": "AQI data is unavailable."
        }

    if travel_time is None:
        return {
            "success": False,
            "error": "Travel time is unavailable."
        }

    # -----------------------------------------------
    # AQI SCORE
    # -----------------------------------------------
    #
    # AQI of 0     -> 0 score
    # AQI of 300+  -> 100 score
    #
    average_aqi_score = min(
        float(average_aqi) / 300,
        1.0
    )

    peak_aqi_score = min(
        float(maximum_aqi or average_aqi) / 300,
        1.0,
    )

    aqi_score = (
        (1 - profile["peak_aqi_weight"]) * average_aqi_score
        + profile["peak_aqi_weight"] * peak_aqi_score
    )

    # -----------------------------------------------
    # TRAVEL TIME SCORE
    # -----------------------------------------------
    #
    # 120 minutes or more -> 100 score
    #
    time_score = min(
        float(travel_time) / 120,
        1.0
    )

    # -----------------------------------------------
    # TRAFFIC SCORE
    # -----------------------------------------------
    #
    # traffic_ratio represents the additional
    # travel time caused by traffic.
    #
    # Example:
    # static time = 40 min
    # traffic time = 50 min
    #
    # traffic ratio = 10 / 40 = 0.25
    #
    traffic_score = min(
        float(traffic_ratio),
        1.0
    )

    # -----------------------------------------------
    # OVERALL SCORE
    # -----------------------------------------------
    #
    # Lower = better
    #
    overall_score = (
        profile["aqi_weight"] * aqi_score
        + profile["time_weight"] * time_score
        + profile["traffic_weight"] * traffic_score
    )

    return {
        "success": True,

        "score": round(
            overall_score * 100,
            2
        ),

        "aqi_score": round(
            aqi_score * 100,
            2
        ),

        "time_score": round(
            time_score * 100,
            2
        ),

        "traffic_score": round(
            traffic_score * 100,
            2
        )
    }


def rank_routes(routes, health_profile="general"):
    """
    Calculate scores and rank routes.

    Lower score means a better route.
    """

    profile_key, profile = get_health_profile(health_profile)

    if profile is None:
        return {
            "success": False,
            "error": "Unsupported health profile.",
        }
    ranked_routes = []

    for route in routes:

        result = calculate_route_score(route, profile)

        if not result["success"]:
            continue

        route_copy = route.copy()

        route_copy["score"] = result[
            "score"
        ]

        route_copy["score_details"] = {

            "aqi_score": result[
                "aqi_score"
            ],

            "time_score": result[
                "time_score"
            ],

            "traffic_score": result[
                "traffic_score"
            ]
        }
        route_copy["health_profile"] = profile["label"]
        route_copy["health_profile_key"] = profile_key
        route_copy["recommendation_reason"] = (
            "Prioritizes lower pollution exposure and peak AQI "
            f"for {profile['label']}."
        )

        ranked_routes.append(
            route_copy
        )

    if not ranked_routes:
        return {
            "success": False,
            "error": "Unable to score routes."
        }

    # Lower score = better route
    ranked_routes.sort(
        key=lambda route: route["score"]
    )

    # Assign ranks
    for index, route in enumerate(
        ranked_routes
    ):
        route["rank"] = index + 1

    best_route = ranked_routes[0]

    return {
        "success": True,

        "recommended_route_id": (
            best_route["route_id"]
        ),

        "health_profile": profile["label"],

        "health_profile_key": profile_key,

        "scoring_weights": {
            "aqi": profile["aqi_weight"],
            "peak_aqi": profile["peak_aqi_weight"],
            "travel_time": profile["time_weight"],
            "traffic": profile["traffic_weight"],
        },

        "routes": ranked_routes
    }
