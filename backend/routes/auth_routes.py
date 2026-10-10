import re

from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash
from pymongo.errors import DuplicateKeyError

from db import get_db, get_db_error
from services.scoring_service import HEALTH_PROFILES

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validate_password_strength(password):
    """
    Validate password meets strength requirements.
    Returns (is_valid, error_message).
    """
    if not isinstance(password, str):
        return False, "Password must be a string."
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters."
    
    if len(password) > 1024:
        return False, "Password must be at most 1024 characters."
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)
    
    missing = []
    if not has_upper:
        missing.append("one uppercase letter")
    if not has_lower:
        missing.append("one lowercase letter")
    if not has_digit:
        missing.append("one number")
    if not has_special:
        missing.append("one special character")
    
    if missing:
        return False, f"Password must contain {', '.join(missing)}."
    
    return True, None


def public_user(document):
    email = document.get("email", "")
    name = (
        document.get("name")
        or document.get("full_name")
        or document.get("fullName")
        or email.partition("@")[0]
        or "AeroMobility user"
    )
    return {
        "id": str(document["_id"]),
        "name": name,
        "email": email,
        "age": document.get("age"),
        "health_profile": document.get("health_profile", "general"),
        "profile_image": document.get("profile_image"),
    }


def user_collection():
    database = get_db()
    if database is None:
        return None
    users = database["users"]
    users.create_index("email", unique=True)
    return users


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    age = data.get("age")
    health_profile = str(data.get("health_profile", "")).strip().lower()
    password = data.get("password", "")

    if not name or len(name) > 100:
        return jsonify({"error": "Enter your name (up to 100 characters)."}), 400
    if len(email) > 254 or not EMAIL_RE.fullmatch(email):
        return jsonify({"error": "Enter a valid email address."}), 400
    try:
        age = int(age)
    except (TypeError, ValueError):
        return jsonify({"error": "Enter your age."}), 400
    if age < 1 or age > 120:
        return jsonify({"error": "Age must be between 1 and 120."}), 400
    if health_profile not in HEALTH_PROFILES:
        return jsonify({"error": "Choose a valid health profile."}), 400
    
    # Validate password strength
    password_valid, password_error = validate_password_strength(password)
    if not password_valid:
        return jsonify({"error": password_error}), 400

    users = user_collection()
    if users is None:
        err = get_db_error() or "Start MongoDB and try again."
        return jsonify({"error": f"Database unavailable: {err}"}), 503

    document = {
        "name": name,
        "email": email,
        "age": age,
        "health_profile": health_profile,
        "password_hash": generate_password_hash(password),
    }
    try:
        result = users.insert_one(document)
    except DuplicateKeyError:
        return jsonify({"error": "An account with this email already exists. Sign in instead."}), 409

    document["_id"] = result.inserted_id
    return jsonify({"user": public_user(document)}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    if not EMAIL_RE.fullmatch(email) or not isinstance(password, str) or not password:
        return jsonify({"error": "Enter a valid email and password."}), 400

    users = user_collection()
    if users is None:
        err = get_db_error() or "Start MongoDB and try again."
        return jsonify({"error": f"Database unavailable: {err}"}), 503

    document = users.find_one({"email": email})
    if not document or not check_password_hash(document.get("password_hash", ""), password):
        return jsonify({"error": "Email or password is incorrect."}), 401
    return jsonify({"user": public_user(document)}), 200


@auth_bp.post("/profile-photo")
def update_profile_photo():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    profile_image = data.get("profile_image")

    if not email:
        return jsonify({"error": "Email is required."}), 400

    users = user_collection()
    if users is not None:
        users.update_one({"email": email}, {"$set": {"profile_image": profile_image}})

    return jsonify({"success": True, "profile_image": profile_image}), 200
