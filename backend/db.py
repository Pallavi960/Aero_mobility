"""
MongoDB connection singleton.

If MongoDB is unavailable the module sets _db = None and logs the error.
All callers must check get_db() for None before using the database.
"""

import logging
import os

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_client = None
_db = None


def get_db():
    """Return the MongoDB database handle, or None if unavailable."""
    global _client, _db

    if _db is not None:
        return _db

    uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/aeromobility")
    db_name = uri.rstrip("/").split("/")[-1].split("?")[0] or "aeromobility"

    try:
        from pymongo import MongoClient, DESCENDING
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

        _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        # Force a connection check
        _client.admin.command("ping")
        _db = _client[db_name]

        # Ensure index on createdAt descending for history queries
        _db["trip_history"].create_index([("createdAt", DESCENDING)])

        logger.info("MongoDB connected: %s / %s", uri, db_name)
    except Exception as exc:
        logger.warning("MongoDB unavailable – history will not be saved. %s", exc)
        _db = None

    return _db
