"""
ZION STOCK OS - Configuration Settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import secrets


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ZION STOCK OS"
    APP_VERSION: str = "1.1.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/zion_stock"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://zion-stock.vercel.app"
    ]
    
    # First Admin
    FIRST_ADMIN_EMAIL: str = "admin@zionpaper.cm"
    FIRST_ADMIN_PASSWORD: str = "ZionAdmin2024!"
    FIRST_ADMIN_NAME: str = "Admin ZION"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
