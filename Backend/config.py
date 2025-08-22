import os
from secrets import token_hex

class Config:
    DB_PATH = os.path.join(os.path.dirname(__file__), 'database', 'app.sqlite')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = token_hex(32)