"""Create only the local SQLite demonstration database; never modifies a MySQL database."""
from pathlib import Path
import secrets
from dotenv import dotenv_values, set_key
from werkzeug.security import generate_password_hash
from app import create_app
from extensions import db
from models.user import User


def prepare():
    env_path = Path(__file__).resolve().parents[1] / '.env'
    values = dotenv_values(env_path)
    if not values.get('SECRET_KEY'):
        set_key(env_path, 'SECRET_KEY', secrets.token_urlsafe(48))
        import os
        os.environ['SECRET_KEY'] = dotenv_values(env_path)['SECRET_KEY']
        from config import Config
        Config.SECRET_KEY = os.environ['SECRET_KEY']
    app = create_app()
    if not app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite:'):
        raise RuntimeError('Este comando é exclusivo para o banco SQLite de demonstração.')
    with app.app_context():
        db.create_all()
        email = 'demo@sentryai.local'
        if not User.query.filter_by(email=email).first():
            db.session.add(User(name='Apresentação SentryAI', email=email,
                                password=generate_password_hash('SentryDemo2026!'), is_verified=True))
            db.session.commit()
        print('Demonstração local preparada. Conta: demo@sentryai.local / SentryDemo2026!')


if __name__ == '__main__':
    prepare()
