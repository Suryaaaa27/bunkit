import cloudinary.uploader

def upload_image(file):
    try:
        result = cloudinary.uploader.upload(
            file,
            folder="bunkit_products"
        )
        return result["secure_url"]
    except Exception as e:
        print("Cloudinary Error:", e)
        return None
