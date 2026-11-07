import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIRECTORY = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIRECTORY / ".env")


@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    log_level: str

    @classmethod
    def from_environment(cls) -> "Settings":
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            raise RuntimeError("The DATABASE_URL environment variable is required.")
        log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
        return cls(database_url=database_url, log_level=log_level)


settings = Settings.from_environment()
