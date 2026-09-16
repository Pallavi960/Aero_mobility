import math
from functools import lru_cache

import pandas as pd

from config.settings import AQI_DATA_PATH
from utils.helpers import validate_coordinates


REQUIRED_COLUMNS = [
    "StationId",
    "Datetime",
    "AQI",
    "StationName",
    "City",
    "State",
    "Latitude",
    "Longitude",
]


@lru_cache(maxsize=1)
def load_aqi_data():
    """
    Load AQI dataset once and reuse it.
    """

    df = pd.read_csv(
        AQI_DATA_PATH,
        usecols=REQUIRED_COLUMNS
    )

    df["Datetime"] = pd.to_datetime(
        df["Datetime"],
        errors="coerce"
    )

    df["AQI"] = pd.to_numeric(
        df["AQI"],
        errors="coerce"
    )

    df["Latitude"] = pd.to_numeric(
        df["Latitude"],
        errors="coerce"
    )

    df["Longitude"] = pd.to_numeric(
        df["Longitude"],
        errors="coerce"
    )

    df = df.dropna(
        subset=[
            "StationId",
            "Datetime",
            "AQI",
            "Latitude",
            "Longitude"
        ]
    )

    return df


def calculate_distance_km(
    latitude1,
    longitude1,
    latitude2,
    longitude2
):
    """
    Calculate distance between two coordinates using Haversine formula.
    """

    earth_radius_km = 6371.0

    lat1 = math.radians(latitude1)
    lat2 = math.radians(latitude2)

    delta_lat = math.radians(
        latitude2 - latitude1
    )

    delta_lon = math.radians(
        longitude2 - longitude1
    )

    a = (
        math.sin(delta_lat / 2) ** 2
        +
        math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius_km * c


def get_aqi_category(aqi):
    """
    Convert AQI value into an Indian AQI category.
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


def get_nearest_station(
    latitude,
    longitude
):
    """
    Find the nearest monitoring station
    to the given coordinates.
    """

    valid, latitude, longitude = validate_coordinates(
        latitude,
        longitude
    )

    if not valid:
        return {
            "success": False,
            "error": "Invalid latitude or longitude."
        }

    df = load_aqi_data()

    stations = (
        df[
            [
                "StationId",
                "StationName",
                "City",
                "State",
                "Latitude",
                "Longitude"
            ]
        ]
        .drop_duplicates("StationId")
        .dropna(
            subset=["Latitude", "Longitude"]
        )
    )

    stations = stations.copy()

    stations["distance_km"] = stations.apply(
        lambda row: calculate_distance_km(
            latitude,
            longitude,
            row["Latitude"],
            row["Longitude"]
        ),
        axis=1
    )

    nearest = stations.loc[
        stations["distance_km"].idxmin()
    ]

    return {
        "success": True,
        "station": {
            "station_id": nearest["StationId"],
            "station_name": nearest["StationName"],
            "city": nearest["City"],
            "state": nearest["State"],
            "latitude": float(nearest["Latitude"]),
            "longitude": float(nearest["Longitude"]),
            "distance_km": round(
                float(nearest["distance_km"]),
                2
            )
        }
    }


def get_latest_aqi(
    station_id
):
    """
    Get the latest available AQI
    for a particular station.
    """

    df = load_aqi_data()

    station_data = df[
        df["StationId"] == station_id
    ]

    if station_data.empty:
        return {
            "success": False,
            "error": "Station not found."
        }

    latest = station_data.loc[
        station_data["Datetime"].idxmax()
    ]

    aqi = float(latest["AQI"])

    return {
        "success": True,
        "aqi": round(aqi, 2),
        "aqi_category": get_aqi_category(aqi),
        "datetime": latest["Datetime"].isoformat(),
        "station_id": latest["StationId"]
    }


def search_stations(query="", limit=8):
    """Return monitoring stations that can be used as route endpoints."""
    stations = (
        load_aqi_data()[
            ["StationId", "StationName", "City", "State", "Latitude", "Longitude"]
        ]
        .drop_duplicates("StationId")
        .dropna(subset=["StationName", "Latitude", "Longitude"])
        .copy()
    )

    search_term = str(query).strip().lower()
    if search_term:
        searchable = (
            stations["StationName"].fillna("") + " "
            + stations["City"].fillna("") + " "
            + stations["State"].fillna("")
        ).str.lower()
        stations = stations[searchable.str.contains(search_term, regex=False)]

    stations = stations.sort_values(["City", "StationName"]).head(limit)
    return [
        {
            "station_id": row["StationId"],
            "station_name": row["StationName"],
            "city": row["City"],
            "state": row["State"],
            "latitude": float(row["Latitude"]),
            "longitude": float(row["Longitude"]),
        }
        for _, row in stations.iterrows()
    ]


def get_nearest_station_aqi(
    latitude,
    longitude
):
    """
    Find nearest station and return
    its latest available AQI.
    """

    station_result = get_nearest_station(
        latitude,
        longitude
    )

    if not station_result["success"]:
        return station_result

    station = station_result["station"]

    aqi_result = get_latest_aqi(
        station["station_id"]
    )

    if not aqi_result["success"]:
        return aqi_result

    return {
        "success": True,
        "location": {
            "latitude": float(latitude),
            "longitude": float(longitude)
        },
        "station": station,
        "aqi": aqi_result["aqi"],
        "aqi_category": aqi_result["aqi_category"],
        "data_datetime": aqi_result["datetime"]
    }
