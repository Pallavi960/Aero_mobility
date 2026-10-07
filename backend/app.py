import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS

from routes.aqi_routes import aqi_bp
from routes.route_routes import route_bp
from routes.history_routes import history_bp
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.places_routes import places_bp

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
if _frontend_url:
    _allowed_origins.append(_frontend_url)

CORS(app, origins=_allowed_origins)


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "message": "AQI backend is running"
    })


app.register_blueprint(route_bp)
app.register_blueprint(aqi_bp)
app.register_blueprint(history_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(places_bp)

# Attempt MongoDB connection at startup (non-fatal if unavailable)
with app.app_context():
    try:
        from db import get_db
        db = get_db()
        if db is not None:
            app.logger.info("MongoDB ready.")
        else:
            app.logger.warning(
                "MongoDB unavailable – history features disabled."
            )
    except Exception as exc:
        app.logger.warning("MongoDB init error: %s", exc)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False,
    )
