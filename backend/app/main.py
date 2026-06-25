from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .analytics import build_alerts, compute_summary
from .config import settings
from .database import ensure_setting, fetch_setting, get_connection, init_db, utc_now
from .exporting import export_csv, export_excel_bytes, export_pdf_bytes
from .schemas import AnalyticsSummary, DeviceCommand, LoginRequest, TelemetryPoint, TokenResponse, UserInfo
from .security import create_session_token, hash_password, utc_expiry, verify_password
from .serial_service import SerialService


app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_scheme = HTTPBearer(auto_error=False)
serial_service = SerialService(on_reading=None)
websocket_clients: set[WebSocket] = set()
event_loop: asyncio.AbstractEventLoop | None = None


def _seed_users() -> None:
    with get_connection() as connection:
        rows = connection.execute("SELECT COUNT(*) AS total FROM users").fetchone()
        if rows[0] == 0:
            now = utc_now()
            connection.execute(
                "INSERT INTO users (email, password_hash, role, full_name, created_at) VALUES (?, ?, ?, ?, ?)",
                ("admin@windmill.local", hash_password("admin123"), "admin", "Windmill Admin", now),
            )
            connection.execute(
                "INSERT INTO users (email, password_hash, role, full_name, created_at) VALUES (?, ?, ?, ?, ?)",
                ("user@windmill.local", hash_password("user123"), "user", "Windmill Operator", now),
            )
            connection.commit()


def _store_reading(reading: dict) -> None:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO telemetry (timestamp, voltage, current, power, rpm, windspeed, temperature, efficiency, status, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                reading["timestamp"],
                reading["voltage"],
                reading["current"],
                reading["power"],
                reading["rpm"],
                reading["windspeed"],
                reading["temperature"],
                reading["efficiency"],
                reading["status"],
                reading.get("source", "live"),
            ),
        )
        connection.commit()


def _publish_reading(reading: dict) -> None:
    global event_loop
    _store_reading(reading)
    readings = _fetch_readings(limit=50)
    _append_alerts(readings)
    if event_loop is None:
        return
    for websocket in list(websocket_clients):
        asyncio.run_coroutine_threadsafe(websocket.send_text(json.dumps({"type": "telemetry", "data": reading})), event_loop)


def _append_alerts(readings: list[dict]) -> list[dict]:
    alerts = build_alerts(readings)
    if not alerts:
        return []
    with get_connection() as connection:
        for alert in alerts:
            connection.execute(
                "INSERT INTO alerts (timestamp, alert_type, severity, message) VALUES (?, ?, ?, ?)",
                (alert["timestamp"], alert["alert_type"], alert["severity"], alert["message"]),
            )
        connection.commit()
    return alerts


def _fetch_readings(limit: int = 500, start: datetime | None = None, end: datetime | None = None) -> list[dict]:
    query = "SELECT timestamp, voltage, current, power, rpm, windspeed, temperature, efficiency, status, source FROM telemetry WHERE 1=1"
    parameters: list[Any] = []
    if start is not None:
        query += " AND timestamp >= ?"
        parameters.append(start.isoformat())
    if end is not None:
        query += " AND timestamp <= ?"
        parameters.append(end.isoformat())
    query += " ORDER BY timestamp DESC LIMIT ?"
    parameters.append(limit)
    with get_connection() as connection:
        rows = connection.execute(query, parameters).fetchall()
    return [dict(row) for row in reversed(rows)]


def _latest_reading() -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT timestamp, voltage, current, power, rpm, windspeed, temperature, efficiency, status, source FROM telemetry ORDER BY timestamp DESC LIMIT 1"
        ).fetchone()
    return dict(row) if row else None


def _authenticate(credentials: HTTPAuthorizationCredentials | None) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    token = credentials.credentials
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT sessions.token, sessions.expires_at, users.id, users.email, users.full_name, users.role
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (token,),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    if datetime.fromisoformat(row[1]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Token expired")
    return {"id": row[2], "email": row[3], "full_name": row[4], "role": row[5]}


@app.on_event("startup")
def startup() -> None:
    global event_loop
    event_loop = asyncio.get_event_loop()
    init_db()
    _seed_users()
    ensure_setting("theme", "dark")
    ensure_setting("units", "metric")

    serial_service._on_reading = _publish_reading
    serial_service.start()


@app.on_event("shutdown")
def shutdown() -> None:
    serial_service.stop()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": serial_service.get_status(), "app": settings.app_name}


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT id, email, password_hash, role, full_name, is_active FROM users WHERE lower(email) = ?",
            (payload.email.lower(),),
        ).fetchone()
        if row is None or not row[5] or not verify_password(payload.password, row[2]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_session_token()
        expires_at = utc_expiry(168 if payload.remember_me else 24)
        connection.execute(
            "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (token, row[0], utc_now(), expires_at),
        )
        connection.commit()
    return TokenResponse(access_token=token, user=UserInfo(id=row[0], email=row[1], full_name=row[4], role=row[3]))


@app.get("/auth/me", response_model=UserInfo)
def me(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> UserInfo:
    user = _authenticate(credentials)
    return UserInfo(**user)


@app.get("/telemetry/latest", response_model=TelemetryPoint)
def telemetry_latest(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> TelemetryPoint:
    _authenticate(credentials)
    latest = _latest_reading()
    if latest is None:
        raise HTTPException(status_code=404, detail="No telemetry available yet")
    return TelemetryPoint(**latest)


@app.get("/telemetry/history")
def telemetry_history(limit: int = 500, credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    rows = _fetch_readings(limit=limit)
    return {"items": rows, "count": len(rows)}


@app.get("/alerts")
def alerts(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT timestamp, alert_type, severity, message, acknowledged FROM alerts ORDER BY timestamp DESC LIMIT 100"
        ).fetchall()
    return {"items": [dict(row) for row in rows]}


@app.get("/analytics/summary", response_model=AnalyticsSummary)
def analytics_summary(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> AnalyticsSummary:
    _authenticate(credentials)
    rows = _fetch_readings(limit=500)
    return AnalyticsSummary(**compute_summary(rows))


@app.post("/device/control")
def device_control(payload: DeviceCommand, credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    user = _authenticate(credentials)
    if payload.command == "demo_mode":
        config = serial_service.set_config(demo_mode=bool(payload.enabled))
        result = {"command": payload.command, "result": "demo_mode_updated", "config": config}
    elif payload.command == "reconnect":
        config = serial_service.set_config()
        result = {"command": payload.command, "result": "restarted", "config": config}
    else:
        result = serial_service.write_command(payload.command, payload.payload | {"enabled": payload.enabled})
    with get_connection() as connection:
        connection.execute(
            "INSERT INTO device_commands (timestamp, command, payload, result) VALUES (?, ?, ?, ?)",
            (utc_now(), payload.command, json.dumps(payload.model_dump()), json.dumps(result)),
        )
        connection.commit()
    return {"ok": True, "user": user["email"], "result": result}


@app.get("/device/status")
def device_status(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    return serial_service.get_status()


@app.get("/device/ports")
def device_ports(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    ports: list[dict] = []
    try:
        from serial.tools import list_ports

        for port in list_ports.comports():
            ports.append({"device": port.device, "description": port.description, "manufacturer": port.manufacturer})
    except Exception:
        ports = [{"device": "SIMULATED", "description": "Demo mode", "manufacturer": None}]
    return {"items": ports}


@app.post("/device/config")
def device_config(payload: dict[str, Any], credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    return serial_service.set_config(
        port=payload.get("port"),
        baud_rate=int(payload.get("baud_rate", settings.serial_baud_rate)),
        demo_mode=bool(payload.get("demo_mode", False)),
    )


@app.get("/settings")
def get_settings(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    return {
        "theme": fetch_setting("theme", "dark"),
        "units": fetch_setting("units", "metric"),
        "refresh_rate": fetch_setting("refresh_rate", "1"),
    }


@app.post("/settings")
def set_settings(payload: dict[str, Any], credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> dict:
    _authenticate(credentials)
    for key, value in payload.items():
        ensure_setting(key, str(value))
    return {"ok": True, "settings": payload}


@app.get("/export/csv")
def export_csv_route(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> Response:
    _authenticate(credentials)
    rows = _fetch_readings(limit=5000)
    content = export_csv(rows)
    return Response(content=content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=windmill-telemetry.csv"})


@app.get("/export/excel")
def export_excel_route(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> Response:
    _authenticate(credentials)
    rows = _fetch_readings(limit=5000)
    content = export_excel_bytes(rows)
    return Response(content=content, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=windmill-telemetry.xlsx"})


@app.get("/export/pdf")
def export_pdf_route(credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> Response:
    _authenticate(credentials)
    rows = _fetch_readings(limit=50)
    content = export_pdf_bytes(rows, title=settings.app_name)
    return Response(content=content, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=windmill-report.pdf"})


@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket) -> None:
    await websocket.accept()
    websocket_clients.add(websocket)
    try:
        while True:
            latest = _latest_reading()
            if latest is not None:
                await websocket.send_json({"type": "telemetry", "data": latest})
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        websocket_clients.discard(websocket)
    except Exception:
        websocket_clients.discard(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host=settings.api_host, port=settings.api_port, reload=True)
