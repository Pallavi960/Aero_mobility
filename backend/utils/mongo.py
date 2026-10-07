import os

from pymongo import MongoClient


_client = None
_database = None


def get_database():
    global _client, _database
    if _database is None:
        uri = (os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://127.0.0.1:27017/").strip()
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _database = _client[os.getenv("MONGODB_DATABASE", "aeromobility")]
    return _database
