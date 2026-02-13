from flask import Blueprint, request, jsonify
from backend.config import SECRET_KEY
from backend.middleware.auth_middleware import auth_required
from bson.objectid import ObjectId
from datetime import datetime
from ..utils.cloudinary_utils import upload_image
print("PRODUCTS ROUTE LOADED")


products_bp = Blueprint("products", __name__, url_prefix="/api/products")

@products_bp.route("", methods=["POST"])
@auth_required
def add_product():
    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    price = request.form.get("price")

    image_file = request.files.get("image")

    if not all([title, description, category, image_file]):
        return jsonify({"error": "Missing required fields"}), 400

    # Upload image to Cloudinary
    image_url = upload_image(image_file)

    if not image_url:
        return jsonify({"error": "Image upload failed"}), 500

    product = {
        "title": title,
        "description": description,
        "category": category,
        "price": int(price) if price else None,
        "imageUrl": image_url,
        "sellerId": ObjectId(request.user_id),
        "createdAt": datetime.utcnow()
    }

    result = db.products.insert_one(product)

    product["_id"] = str(result.inserted_id)
    product["sellerId"] = str(product["sellerId"])

    return jsonify(product), 201

@products_bp.route("", methods=["GET"])
def get_products():
    products = list(
        db.products.find().sort("createdAt", -1)
    )

    for product in products:
        product["_id"] = str(product["_id"])
        seller_id = product["sellerId"]

        # Fetch seller info
        user = db.users.find_one({"_id": seller_id})

        product["seller"] = {
            "name": user.get("name") if user else None,
            "whatsapp": user.get("whatsapp") if user else None
        }

        product["sellerId"] = str(product["sellerId"])

    return jsonify(products), 200


@products_bp.route("/my", methods=["GET"])
@auth_required
def get_my_products():
    user_id = ObjectId(request.user_id)

    products = list(
        db.products.find({"sellerId": user_id}).sort("createdAt", -1)
    )

    for product in products:
        product["_id"] = str(product["_id"])
        product["sellerId"] = str(product["sellerId"])

        user = db.users.find_one({"_id": ObjectId(product["sellerId"])})

        product["seller"] = {
            "name": user.get("name") if user else None,
            "whatsapp": user.get("whatsapp") if user else None
        }

    return jsonify(products), 200


@products_bp.route("/<product_id>", methods=["DELETE"])
@auth_required
def delete_product(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)})

    if not product:
        return jsonify({"error": "Product not found"}), 404

    if str(product["sellerId"]) != request.user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.products.delete_one({"_id": ObjectId(product_id)})

    return jsonify({"message": "Product deleted"}), 200
