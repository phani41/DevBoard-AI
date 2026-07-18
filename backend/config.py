from pydantic_settings import BaseSettings
from typing import List
import os
import sys


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/devboard")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
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
        """Auto-select sender email based on environment."""
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

    def validate_production(self):
        """Check production requirements on startup. Exits with clear message if misconfigured."""
        if self.ENVIRONMENT != "production":
            return

        errors = []
        if not self.SECRET_KEY:
            errors.append("SECRET_KEY must be set in production")
        if self.FROM_EMAIL and not self.FROM_EMAIL.endswith(".com"):
            errors.append(f"FROM_EMAIL '{self.FROM_EMAIL}' may not be a verified domain")
        if not self.RESEND_API_KEY:
            errors.append("RESEND_API_KEY is required in production for password reset emails")
        if "localhost" in self.CORS_ORIGINS:
            errors.append("CORS_ORIGINS should not contain localhost in production")
        if "localhost" in self.FRONTEND_URL:
            errors.append("FRONTEND_URL should not be localhost in production")

        if errors:
            print("=" * 60)
            print("PRODUCTION CONFIGURATION ERRORS:")
            for e in errors:
                print(f"  - {e}")
            print("=" * 60)
            sys.exit(1)


settings = Settings()
settings.validate_production()
