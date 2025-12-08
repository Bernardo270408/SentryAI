from pydantic_settings import BaseSettings
from typing import List
import dotenv, os

dotenv.load_dotenv()

class Settings(BaseSettings):
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("1", "true", "yes")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024  # 16 MB
    ALLOWED_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


Settings = Settings()
