"""
Saved Places model.

Validates, stores, and retrieves saved places per user.
Supports MongoDB with automatic fallback to JSON persistence if MongoDB is unavailable.
"""

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from db import get_db

logger = logging.getLogger(__name__)

COLLECTION = "saved_places"
FALLBACK_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "saved_places.json")

ALLOWED_CATEGORIES = {
    "home",
    "college",
    "work",
    "gym",
    "hospital",
    "transit",
    "custom",
    "other",
}


def _validate_coord(value, name):
    try:
        f = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{name} must be a valid number.")
    return f


def _validate_place_data(data):
    if not isinstance(data, dict):
        raise ValueError("Place data must be a valid JSON object.")

    name = str(data.get("name", "")).strip()
    if not name or len(name) > 100:
        raise ValueError("Place name is required (up to 100 characters).")

    user_id = str(data.get("user_id", "") or data.get("userId", "") or data.get("email", "")).strip()
    if not user_id:
        raise ValueError("User identification is required.")

    address = str(data.get("address", "") or data.get("station_name", "") or name).strip()
    category = str(data.get("category", "") or data.get("type", "custom")).strip().lower()
    if category not in ALLOWED_CATEGORIES:
        category = "custom"

    lat = _validate_coord(data.get("latitude") or data.get("lat"), "latitude")
    lng = _validate_coord(data.get("longitude") or data.get("lng"), "longitude")

    if not (-90 <= lat <= 90):
        raise ValueError("Latitude out of range (-90 to 90).")
    if not (-180 <= lng <= 180):
        raise ValueError("Longitude out of range (-180 to 180).")

    station_id = str(data.get("station_id", "") or "").strip() or None

    return {
        "user_id": user_id,
        "name": name,
        "category": category,
        "address": address,
        "latitude": lat,
        "longitude": lng,
        "station_id": station_id,
    }


def _serialise_mongo(doc):
    if doc is None:
        return None
    d = dict(doc)
    d["id"] = str(d["_id"])
    del d["_id"]
    if isinstance(d.get("created_at"), datetime):
        d["created_at"] = d["created_at"].isoformat()
    if isinstance(d.get("updated_at"), datetime):
        d["updated_at"] = d["updated_at"].isoformat()
    return d


# ── File-based fallback helpers ───────────────────────────────────────────────

def _load_fallback():
    if not os.path.exists(FALLBACK_FILE):
        return []
    try:
        with open(FALLBACK_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Could not read fallback saved_places file: %s", exc)
        return []


def _save_fallback(data):
    try:
        os.makedirs(os.path.dirname(FALLBACK_FILE), exist_ok=True)
        with open(FALLBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as exc:
        logger.error("Could not write fallback saved_places file: %s", exc)


# ── Public Model Operations ───────────────────────────────────────────────────

def get_saved_places(user_id):
    """Return all saved places for a specific user."""
    if not user_id:
        return [], None

    user_id_str = str(user_id).strip()
    db = get_db()
    if db is not None:
        try:
            cursor = db[COLLECTION].find({"user_id": user_id_str}).sort("created_at", 1)
            places = [_serialise_mongo(doc) for doc in cursor]
            return places, None
        except Exception as exc:
            logger.error("Failed to query MongoDB saved_places: %s", exc)
            # fallback below

    # Local fallback
    items = _load_fallback()
    user_places = [item for item in items if str(item.get("user_id")).strip() == user_id_str]
    return user_places, None


def create_saved_place(payload):
    """Validate and insert a new saved place for a user."""
    try:
        clean = _validate_place_data(payload)
    except ValueError as exc:
        return None, str(exc)

    now_iso = datetime.now(timezone.utc).isoformat()
    now_dt = datetime.now(timezone.utc)

    db = get_db()
    if db is not None:
        try:
            doc = dict(clean)
            doc["created_at"] = now_dt
            doc["updated_at"] = now_dt
            res = db[COLLECTION].insert_one(doc)
            doc["_id"] = res.inserted_id
            return _serialise_mongo(doc), None
        except Exception as exc:
            logger.error("Failed to insert into MongoDB saved_places: %s", exc)
            # fallback below

    # Local fallback
    items = _load_fallback()
    new_doc = dict(clean)
    new_doc["id"] = f"sp_{uuid.uuid4().hex[:12]}"
    new_doc["created_at"] = now_iso
    new_doc["updated_at"] = now_iso
    items.append(new_doc)
    _save_fallback(items)
    return new_doc, None


def update_saved_place(place_id, payload, user_id=None):
    """Update an existing saved place."""
    if not place_id:
        return None, "Place ID is required."

    try:
        clean = _validate_place_data(payload)
    except ValueError as exc:
        return None, str(exc)

    now_iso = datetime.now(timezone.utc).isoformat()
    now_dt = datetime.now(timezone.utc)

    db = get_db()
    if db is not None:
        try:
            try:
                oid = ObjectId(place_id)
                query = {"_id": oid}
            except InvalidId:
                query = {"id": place_id}

            if user_id:
                query["user_id"] = str(user_id).strip()

            update_fields = {
                "name": clean["name"],
                "category": clean["category"],
                "address": clean["address"],
                "latitude": clean["latitude"],
                "longitude": clean["longitude"],
                "station_id": clean["station_id"],
                "updated_at": now_dt,
            }

            res = db[COLLECTION].find_one_and_update(
                query,
                {"$set": update_fields},
                return_document=True,
            )
            if res:
                return _serialise_mongo(res), None
        except Exception as exc:
            logger.error("Failed to update in MongoDB saved_places: %s", exc)

    # Local fallback
    items = _load_fallback()
    target_idx = None
    for idx, item in enumerate(items):
        if str(item.get("id")) == str(place_id):
            if user_id and str(item.get("user_id")).strip() != str(user_id).strip():
                continue
            target_idx = idx
            break

    if target_idx is None:
        return None, "Saved place not found."

    items[target_idx].update({
        "name": clean["name"],
        "category": clean["category"],
        "address": clean["address"],
        "latitude": clean["latitude"],
        "longitude": clean["longitude"],
        "station_id": clean["station_id"],
        "updated_at": now_iso,
    })
    _save_fallback(items)
    return items[target_idx], None


def delete_saved_place(place_id, user_id=None):
    """Delete a saved place."""
    if not place_id:
        return False, "Place ID is required."

    db = get_db()
    if db is not None:
        try:
            try:
                oid = ObjectId(place_id)
                query = {"_id": oid}
            except InvalidId:
                query = {"id": place_id}

            if user_id:
                query["user_id"] = str(user_id).strip()

            res = db[COLLECTION].delete_one(query)
            if res.deleted_count > 0:
                return True, None
        except Exception as exc:
            logger.error("Failed to delete from MongoDB saved_places: %s", exc)

    # Local fallback
    items = _load_fallback()
    initial_len = len(items)
    items = [
        item for item in items
        if not (str(item.get("id")) == str(place_id) and (not user_id or str(item.get("user_id")).strip() == str(user_id).strip()))
    ]
    if len(items) == initial_len:
        return False, "Saved place not found."

    _save_fallback(items)
    return True, None
