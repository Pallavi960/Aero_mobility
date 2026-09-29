from flask import Blueprint, jsonify, request

from models.saved_places import (
    get_saved_places,
    create_saved_place,
    update_saved_place,
    delete_saved_place,
)

places_bp = Blueprint("places_bp", __name__, url_prefix="/api/places")


@places_bp.route("", methods=["GET"])
def list_places():
    user_id = request.args.get("user_id") or request.args.get("userId") or request.args.get("email")
    if not user_id:
        return jsonify({"success": False, "error": "User identifier is required."}), 400

    places, err = get_saved_places(user_id)
    if err:
        return jsonify({"success": False, "error": err}), 500

    return jsonify({"success": True, "places": places}), 200


@places_bp.route("", methods=["POST"])
def add_place():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id") or data.get("userId") or data.get("email")
    if not user_id:
        return jsonify({"success": False, "error": "User identifier is required."}), 400

    new_place, err = create_saved_place(data)
    if err:
        return jsonify({"success": False, "error": err}), 400

    return jsonify({"success": True, "place": new_place}), 201


@places_bp.route("/<place_id>", methods=["PUT"])
def edit_place(place_id):
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id") or data.get("userId") or data.get("email")

    updated, err = update_saved_place(place_id, data, user_id=user_id)
    if err:
        status_code = 404 if "not found" in err.lower() else 400
        return jsonify({"success": False, "error": err}), status_code

    return jsonify({"success": True, "place": updated}), 200


@places_bp.route("/<place_id>", methods=["DELETE"])
def remove_place(place_id):
    user_id = request.args.get("user_id") or request.args.get("userId") or request.args.get("email")
    if not user_id:
        # Check body if provided
        body = request.get_json(silent=True) or {}
        user_id = body.get("user_id") or body.get("userId") or body.get("email")

    ok, err = delete_saved_place(place_id, user_id=user_id)
    if not ok:
        status_code = 404 if err and "not found" in err.lower() else 400
        return jsonify({"success": False, "error": err or "Failed to delete saved place."}), status_code

    return jsonify({"success": True, "message": "Saved place deleted successfully."}), 200
