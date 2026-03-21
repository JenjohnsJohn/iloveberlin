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

    # Logging
    log_level: str = "INFO"


settings = Settings()
