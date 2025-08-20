from flask import Flask
from flask_cors import CORS
from config import Config, db
from flask_migrate import Migrate

app = Flask(__name__)
migrate = Migrate()

def create_app():
    """
    Esta função cria a aplicação FLASK, registra as rotas
    e inicializa o banco de dados
    
    """
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)
    
    CORS(app, supports_credentials=True)
    
    #Import routers
    from router.test_router import test_bp
    
    #Register blueprints
    app.register_blueprint(test_bp)
    
    return app



if __name__ == '__main__':
    app = create_app()
    
    app.run(debug=True)