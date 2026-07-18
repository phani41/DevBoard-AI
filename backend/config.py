from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/devboard")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    # Environment (development | production)
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Resend email settings
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "")
    FROM_NAME: str = os.getenv("FROM_NAME", "DevBoard AI")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))

    @property
    def effective_from_email(self) -> str:
        """
        Auto-select the sender email address based on environment.

        - Development: uses Resend's default `onboarding@resend.dev`
          (no domain verification needed — emails only go to the account owner).
        - Production: uses FROM_EMAIL from environment variables
          (requires a verified domain in Resend).
        """
        if self.ENVIRONMENT == "production":
            return self.FROM_EMAIL or "noreply@devboard.app"
        return "onboarding@resend.dev"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT != "production"

    class Config:
        env_file = ".env"


settings = Settings()
