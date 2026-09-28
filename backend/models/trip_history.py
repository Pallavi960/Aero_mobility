"""
Trip history model.

Validates, stores, and retrieves trip history documents in MongoDB.
All functions return plain dicts so Flask can jsonify them directly.
"""

import logging
from datetime import datetime, timezone, timedelta

from bson import ObjectId
from bson.errors import InvalidId

from db import get_db

logger = logging.getLogger(__name__)

COLLECTION = "trip_history"


# ── Validation ────────────────────────────────────────────────────────────────

def _validate_coord(value, name):
    try:
        f = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{name} must be a number.")
    return f


def _validate_location(loc, label):
    if not isinstance(loc, dict):
        raise ValueError(f"{label} must be an object.")
    name = str(loc.get("name", "")).strip()
    if not name:
        raise ValueError(f"{label}.name is required.")
    lat = _validate_coord(loc.get("latitude"), f"{label}.latitude")
    lng = _validate_coord(loc.get("longitude"), f"{label}.longitude")
    if not (-90 <= lat <= 90):
        raise ValueError(f"{label}.latitude out of range.")
    if not (-180 <= lng <= 180):
        raise ValueError(f"{label}.longitude out of range.")
    return {"name": name, "latitude": lat, "longitude": lng}


ALLOWED_PROFILES = {"general", "respiratory", "cardiovascular", "elderly", "child"}


def _validate_health_profile(hp):
    if not isinstance(hp, dict):
        raise ValueError("healthProfile must be an object.")
    pid = str(hp.get("id", "")).strip().lower()
    if pid not in ALLOWED_PROFILES:
        raise ValueError(f"healthProfile.id '{pid}' is not allowed.")
    name = str(hp.get("name", "")).strip()
    return {"id": pid, "name": name or pid}


def _validate_recommended_route(rr):
    if not isinstance(rr, dict):
        raise ValueError("recommendedRoute must be an object.")

    def _opt_float(v):
        try:
            return round(float(v), 4) if v is not None else None
        except (TypeError, ValueError):
            return None

    return {
        "routeId": str(rr.get("routeId", "")).strip(),
        "travelTimeMinutes": _opt_float(rr.get("travelTimeMinutes")),
        "distanceKm": _opt_float(rr.get("distanceKm")),
        "aqi": _opt_float(rr.get("aqi")),
        "peakAqi": _opt_float(rr.get("peakAqi")),
        "aqiCategory": str(rr.get("aqiCategory", "")).strip(),
        "traffic": str(rr.get("traffic", "")).strip(),
        "score": _opt_float(rr.get("score")),
    }


def build_document(payload):
    """Validate payload and return a clean MongoDB document (no _id yet)."""
    origin = _validate_location(payload.get("from"), "from")
    destination = _validate_location(payload.get("to"), "to")
    health_profile = _validate_health_profile(payload.get("healthProfile", {}))
    recommended_route = _validate_recommended_route(payload.get("recommendedRoute", {}))

    try:
        route_count = int(payload.get("routeCount", 0))
    except (TypeError, ValueError):
        route_count = 0

    return {
        "createdAt": datetime.now(timezone.utc),
        "from": origin,
        "to": destination,
        "healthProfile": health_profile,
        "routeCount": route_count,
        "recommendedRoute": recommended_route,
    }


# ── Serialisation ─────────────────────────────────────────────────────────────

def _serialise(doc):
    """Convert a MongoDB document to a JSON-safe dict."""
    if doc is None:
        return None
    d = dict(doc)
    d["_id"] = str(d["_id"])
    if isinstance(d.get("createdAt"), datetime):
        d["createdAt"] = d["createdAt"].isoformat()
    return d


# ── CRUD helpers ──────────────────────────────────────────────────────────────

def save_trip(payload):
    """
    Validate and insert a trip history document.

    Returns (inserted_id_str, None) on success or (None, error_message) on failure.
    Includes duplicate-search protection: skips insert if an identical
    from/to/profile search was saved within the last 60 seconds.
    """
    db = get_db()
    if db is None:
        return None, "MongoDB unavailable."

    try:
        doc = build_document(payload)
    except ValueError as exc:
        return None, str(exc)

    # Duplicate protection – same origin, destination, profile within 60 s
    window = datetime.now(timezone.utc) - timedelta(seconds=60)
    existing = db[COLLECTION].find_one({
        "from.name": doc["from"]["name"],
        "to.name": doc["to"]["name"],
        "healthProfile.id": doc["healthProfile"]["id"],
        "createdAt": {"$gte": window},
    })
    if existing:
        logger.info("Duplicate trip search suppressed.")
        return str(existing["_id"]), None

    try:
        result = db[COLLECTION].insert_one(doc)
        return str(result.inserted_id), None
    except Exception as exc:
        logger.error("Failed to save trip history: %s", exc)
        return None, str(exc)


def get_history(page=1, limit=20):
    """Return paginated history records, newest first."""
    db = get_db()
    if db is None:
        return None, "MongoDB unavailable."
    try:
        limit = min(max(int(limit), 1), 100)
        page = max(int(page), 1)
        skip = (page - 1) * limit
        cursor = db[COLLECTION].find({}).sort("createdAt", -1).skip(skip).limit(limit)
        total = db[COLLECTION].count_documents({})
        return {
            "trips": [_serialise(d) for d in cursor],
            "total": total,
            "page": page,
            "limit": limit,
        }, None
    except Exception as exc:
        logger.error("Failed to fetch history: %s", exc)
        return None, str(exc)


def get_trip_by_id(trip_id):
    """Return a single trip document by its string _id."""
    db = get_db()
    if db is None:
        return None, "MongoDB unavailable."
    try:
        oid = ObjectId(trip_id)
    except InvalidId:
        return None, "Invalid trip ID."
    try:
        doc = db[COLLECTION].find_one({"_id": oid})
        if doc is None:
            return None, "Trip not found."
        return _serialise(doc), None
    except Exception as exc:
        logger.error("Failed to fetch trip %s: %s", trip_id, exc)
        return None, str(exc)


def delete_trip_by_id(trip_id):
    """Delete a single trip. Returns (True, None) or (False, error)."""
    db = get_db()
    if db is None:
        return False, "MongoDB unavailable."
    try:
        oid = ObjectId(trip_id)
    except InvalidId:
        return False, "Invalid trip ID."
    try:
        result = db[COLLECTION].delete_one({"_id": oid})
        if result.deleted_count == 0:
            return False, "Trip not found."
        return True, None
    except Exception as exc:
        logger.error("Failed to delete trip %s: %s", trip_id, exc)
        return False, str(exc)


def delete_all_trips():
    """Delete every trip history document. Returns (count, None) or (None, error)."""
    db = get_db()
    if db is None:
        return None, "MongoDB unavailable."
    try:
        result = db[COLLECTION].delete_many({})
        return result.deleted_count, None
    except Exception as exc:
        logger.error("Failed to clear history: %s", exc)
        return None, str(exc)
