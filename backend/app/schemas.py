from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=4)
    remember_me: bool = False


class UserInfo(BaseModel):
    id: int
    email: str
    full_name: str
    role: Literal["admin", "user"]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo


class TelemetryPoint(BaseModel):
    timestamp: datetime
    voltage: float
    current: float
    power: float
    rpm: float
    windspeed: float
    temperature: float
    efficiency: float
    status: str
    source: str = "live"


class DeviceCommand(BaseModel):
    command: Literal["led", "relay", "fan", "calibrate", "reconnect", "demo_mode"]
    enabled: Optional[bool] = None
    payload: dict[str, str | int | float | bool] = Field(default_factory=dict)


class AlertItem(BaseModel):
    timestamp: datetime
    alert_type: str
    severity: Literal["info", "warning", "critical"]
    message: str


class AnalyticsSummary(BaseModel):
    total_energy_today_kwh: float
    average_efficiency: float
    peak_power_w: float
    peak_wind_speed: float
    best_operating_time: str
    prediction_next_hour_power_w: float
    predicted_daily_energy_kwh: float
    insights: list[str]


class HistoryQuery(BaseModel):
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    limit: int = 500
