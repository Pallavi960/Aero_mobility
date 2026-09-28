from flask import Blueprint, jsonify, request

from models.trip_history import (
    get_history,
    get_trip_by_id,
    delete_trip_by_id,
    delete_all_trips,
)

history_bp = Blueprint("history_bp", __name__, url_prefix="/api/history")


@history_bp.route("", methods=["GET"])
def list_history():
    page = request.args.get("page", 1)
    limit = request.args.get("limit", 20)
    data, err = get_history(page, limit)
    if err:
        return jsonify({"success": False, "error": err}), 503
    return jsonify({"success": True, **data}), 200


@history_bp.route("/<trip_id>", methods=["GET"])
def get_trip(trip_id):
    trip, err = get_trip_by_id(trip_id)
    if err:
        status = 404 if "not found" in err.lower() or "invalid" in err.lower() else 503
        return jsonify({"success": False, "error": err}), status
    return jsonify({"success": True, "trip": trip}), 200


@history_bp.route("/<trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    ok, err = delete_trip_by_id(trip_id)
    if not ok:
        status = 404 if "not found" in err.lower() or "invalid" in err.lower() else 503
        return jsonify({"success": False, "error": err}), status
    return jsonify({"success": True, "message": "Trip deleted."}), 200


@history_bp.route("", methods=["DELETE"])
def clear_history():
    count, err = delete_all_trips()
    if err:
        return jsonify({"success": False, "error": err}), 503
    return jsonify({"success": True, "deleted": count}), 200
