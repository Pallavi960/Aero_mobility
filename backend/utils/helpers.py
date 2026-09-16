def success_response(data):
    return {
        "success": True,
        "data": data
    }


def error_response(message):
    return {
        "success": False,
        "error": message
    }


def validate_coordinates(latitude, longitude):
    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):
        return False, None, None

    if not (-90 <= latitude <= 90):
        return False, None, None

    if not (-180 <= longitude <= 180):
        return False, None, None

    return True, latitude, longitude