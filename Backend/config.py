import os
import dotenv

class Config:
    SECRET_KEY = dotenv.get_key(dotenv.find_dotenv(), 'SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = dotenv.get_key(dotenv.find_dotenv(), 'DB_PATH')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
