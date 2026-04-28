from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    JWT_SECRET: str = "your-secret-key-change-this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REDIS_URL: str = "redis://localhost:6379/0"
    UPLOAD_DIR: str = "./uploads"
    GEMINI_API_KEY: str = "your-gemini-api-key"

    class Config:
        env_file = ".env"

settings = Settings()