from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MMHCS Backend"
    api_prefix: str = "/api"
    secret_key: str = "change-me"
    access_token_exp_minutes: int = 30
    refresh_token_exp_days: int = 14

    postgres_dsn: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mmhcs"
    auto_create_db: bool = True

    class Config:
        env_file = ".env"
        env_prefix = "MMHCS_"


settings = Settings()
