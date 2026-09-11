from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from flask_migrate import Migrate
from models import User, Chat, UserMessage, AIMessage
from dotenv import load_dotenv
import os

load_dotenv()

migrate = Migrate()


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)
    if not app.config.get("SECRET_KEY") or app.config["SECRET_KEY"] == "sua_chave_secreta_aqui":
        raise RuntimeError("Configure SECRET_KEY com uma chave aleatória no .env da raiz.")
    if not app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise RuntimeError("Configure DATABASE_URL no .env da raiz.")

    @app.before_request
    def validate_json_body():
        from flask import request
        if request.is_json and not isinstance(request.get_json(silent=True), dict):
            return jsonify({"error": "Envie um objeto JSON válido."}), 400

    @app.errorhandler(413)
    def upload_too_large(error):
        return jsonify({"error": "O arquivo excede o limite de 16 MB."}), 413

    db.init_app(app)
    migrate.init_app(app, db)

    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Test Route
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({"message": "API is running"}), 200

    # Import routers
    from router.auth_router import auth_bp
    from router.user_router import user_bp
    from router.message_user_router import message_user_bp
    from router.message_ai_router import message_ai_bp
    from router.chat_router import chat_bp
    from router.rating_router import rating_bp
    from router.contract_router import contract_bp
    from router.dashboard_router import dashboard_bp
    from router.admin_router import admin_bp
    from router.documents_router import documents_bp

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(message_user_bp)
    app.register_blueprint(message_ai_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(rating_bp)
    app.register_blueprint(contract_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(documents_bp, url_prefix='/documents')

    return app


if __name__ == "__main__":
    app = create_app()
    # 'host=0.0.0.0' expõe o servidor para a rede local
    app.run(debug=os.getenv('FLASK_DEBUG') == '1', host='127.0.0.1', port=5000)
