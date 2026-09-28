import logging
from flask import Blueprint, request, jsonify

from services.chat_service import generate_chat_response

logger = logging.getLogger(__name__)

chat_bp = Blueprint("chat_bp", __name__, url_prefix="/api")


@chat_bp.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    """
    POST /api/chat
    Payload:
    {
      "message": "...",
      "context": { ... },
      "history": [ ... ]
    }
    """
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({
            "reply": "Hi! How can I help you with your journey, AQI, or route recommendations today?"
        }), 200

    context_data = data.get("context") or {}
    history = data.get("history") or []

    try:
        result = generate_chat_response(message, context_data=context_data, history=history)
        reply = result.get("reply", "I'm having trouble analyzing the request right now. Please try again.")
        return jsonify({"reply": reply}), 200
    except Exception as exc:
        logger.error("Chat route unhandled exception: %s", exc)
        return jsonify({
            "reply": "Sorry, I couldn't connect to the assistant right now. Please try again."
        }), 200
