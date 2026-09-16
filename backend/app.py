import logging

from flask import Flask, jsonify
from flask_cors import CORS

from routes.aqi_routes import aqi_bp
from routes.route_routes import route_bp


app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

CORS(app)


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "message": "AQI backend is running"
    })


app.register_blueprint(route_bp)
app.register_blueprint(aqi_bp)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
