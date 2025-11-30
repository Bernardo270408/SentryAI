from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db
from flask_migrate import Migrate
from models import User, Chat, UserMessage, AIMessage

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)  
    
    CORS(app, supports_credentials=True)

    # Test Route
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "API is running"}), 200
    
    # Import routers
    from router.auth_router import auth_bp
    from router.user_router import user_bp
    from router.message_user_router import message_user_bp
    from router.message_ai_router import message_ai_bp
    from Backend.services.chat_router import chat_bp
    from router.rating_router import rating_bp
    from router.contract_router import contract_bp
    from router.dashboard_router import dashboard_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(message_user_bp)
    app.register_blueprint(message_ai_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(rating_bp)
    app.register_blueprint(contract_bp)
    app.register_blueprint(dashboard_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
