from flask import Blueprint, request, jsonify
from backend.config import db
from ..utils.auth_utils import hash_password, check_password, generate_jwt
from bson.objectid import ObjectId

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    whatsapp = data.get("whatsapp")

    if not all([name, email, password, whatsapp]):
        return jsonify({"error": "All fields required"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    user = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "whatsapp": whatsapp
    }

    user_id = db.users.insert_one(user).inserted_id
    token = generate_jwt(str(user_id))

    return jsonify({"token": token}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = db.users.find_one({"email": email})
    if not user or not check_password(password, user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_jwt(str(user["_id"]))
    return jsonify({"token": token}), 200
