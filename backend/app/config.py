from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "backend" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class Settings:
    app_name: str = "Smart Windmill Energy Monitoring & Analytics Platform"
    database_path: Path = DATA_DIR / "windmill.db"
    secret_key: str = os.getenv("WINDMILL_SECRET_KEY", "windmill-dev-secret")
    api_host: str = os.getenv("WINDMILL_API_HOST", "127.0.0.1")
    api_port: int = int(os.getenv("WINDMILL_API_PORT", "8000"))
    cors_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    )
    serial_baud_rate: int = int(os.getenv("WINDMILL_BAUD_RATE", "9600"))
    demo_mode: bool = os.getenv("WINDMILL_DEMO_MODE", "1") == "1"


settings = Settings()
