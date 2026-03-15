from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Content engine's own database
    engine_database_url: str = (
        "postgresql+asyncpg://engine:engine_pass@localhost:5433/content_engine"
    )

    # I♥Berlin API
    iloveberlin_api_url: str = "http://localhost:3001/api"
    iloveberlin_admin_email: str = "admin@iloveberlin.biz"
    iloveberlin_admin_password: str = ""

    # AI (Kimi K2.5)
    kimi_api_key: str = ""
    kimi_base_url: str = "https://api.moonshot.ai/v1"
    kimi_model: str = "kimi-k2.5"

    # YouTube
    youtube_api_key: str = ""

    # Admin panel auth
    admin_password_hash: str = ""

    # Kling AI image generation
    kling_access_key: str = ""
    kling_secret_key: str = ""

    # Google Places API (New)
    google_places_api_key: str = ""

    # Logging
    log_level: str = "INFO"


settings = Settings()


def validate_settings():
    """Validate critical settings at startup. Raise on missing required keys, warn on optional."""
    import sys
    import logging

    logger = logging.getLogger("config.settings")
    errors = []

    if not settings.iloveberlin_api_url:
        errors.append("iloveberlin_api_url is required")
    if not settings.iloveberlin_admin_email:
        errors.append("iloveberlin_admin_email is required")
    if not settings.iloveberlin_admin_password:
        errors.append("iloveberlin_admin_password is required")
    if not settings.admin_password_hash:
        errors.append("admin_password_hash is required for admin panel auth")

    if errors:
        for e in errors:
            logger.critical("MISSING REQUIRED CONFIG: %s", e)
        sys.exit(1)

    # Warn on optional keys
    if not settings.google_places_api_key:
        logger.warning("google_places_api_key not set — restaurant pipeline will be disabled")
    if not settings.kimi_api_key:
        logger.warning("kimi_api_key not set — AI enrichment will be disabled")
    if not settings.kling_access_key or not settings.kling_secret_key:
        logger.warning("Kling credentials not set — AI image generation will be disabled")
    if not settings.youtube_api_key:
        logger.warning("youtube_api_key not set — video pipeline will be disabled")
