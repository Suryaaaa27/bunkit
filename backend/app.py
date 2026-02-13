from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY
from routes.auth import auth_bp
from routes.users import users_bp
from routes.products import products_bp


app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = SECRET_KEY

app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(products_bp)

@app.route("/")
def health_check():
    return {"status": "BUNKIT backend running 🚀"}

if __name__ == "__main__":
    app.run(debug=True)
