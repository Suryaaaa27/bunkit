from flask import Blueprint, jsonify, request
from backend.config import db
from backend.middleware.auth_middleware import auth_required
from bson.objectid import ObjectId

users_bp = Blueprint("users", __name__, url_prefix="/api/users")

@users_bp.route("/me", methods=["GET"])
@auth_required
def get_profile():
    user_id = request.user_id

    user = db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"password": 0}
    )

    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify(user), 200
