from utils.helpers import validate_coordinates


def validate_location(latitude, longitude):
    """
    Validate and return a user's latitude and longitude.
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

    return {
        "success": True,
        "latitude": latitude,
        "longitude": longitude
    }