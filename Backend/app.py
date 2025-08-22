from flask import Flask
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
    
    # Import routers
    from router.test_router import test_bp
    from router.auth_router import auth_bp
    from router.user_router import user_bp
    
    # Register blueprints
    app.register_blueprint(test_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
