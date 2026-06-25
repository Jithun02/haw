from __future__ import annotations

import random
import threading
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Callable

try:
    import serial
    from serial.tools import list_ports
except Exception:
    serial = None
    list_ports = None

from .config import settings


TelemetryHandler = Callable[[dict], None]


@dataclass
class SerialConfig:
    port: str | None = None
    baud_rate: int = settings.serial_baud_rate
    demo_mode: bool = settings.demo_mode


class SerialService:
    def __init__(self, on_reading: TelemetryHandler | None = None) -> None:
        self._on_reading = on_reading
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._serial = None
        self._last_telemetry: dict | None = None
        self._config = SerialConfig()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="SerialService", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        if self._serial is not None:
            try:
                self._serial.close()
            except Exception:
                pass
            self._serial = None

    def set_config(self, port: str | None = None, baud_rate: int | None = None, demo_mode: bool | None = None) -> dict:
        with self._lock:
            if port is not None:
                self._config.port = port or None
            if baud_rate is not None:
                self._config.baud_rate = baud_rate
            if demo_mode is not None:
                self._config.demo_mode = demo_mode
            self.stop()
            self.start()
            return asdict(self._config)

    def get_status(self) -> dict:
        with self._lock:
            return {
                "connected": self._serial is not None or self._config.demo_mode,
                "port": self._config.port or self._auto_detect_port(),
                "baud_rate": self._config.baud_rate,
                "demo_mode": self._config.demo_mode,
                "firmware_version": "v2.3.0" if self._serial is not None else "simulated",
                "last_reading": self._last_telemetry,
            }

    def write_command(self, command: str, payload: dict | None = None) -> dict:
        payload = payload or {}
        serial_command = self._map_command(command, payload)
        message = {"command": command, "payload": payload, "serial_command": serial_command, "result": "queued"}
        if self._serial is not None:
            try:
                self._serial.write((serial_command + "\n").encode("utf-8"))
                message["result"] = "sent"
            except Exception as exc:
                message["result"] = f"error: {exc}"
        return message

    def _map_command(self, command: str, payload: dict) -> str:
        enabled = payload.get("enabled")
        if command == "led":
            return "LED_ON" if enabled else "LED_OFF"
        if command == "relay":
            return "RELAY_ON" if enabled else "RELAY_OFF"
        if command == "fan":
            return "FAN_ON" if enabled else "FAN_OFF"
        if command == "calibrate":
            return "CALIBRATE"
        if command == "reconnect":
            return "RECONNECT"
        if command == "demo_mode":
            return "DEMO_ON" if enabled else "DEMO_OFF"
        return command.upper()

    def _run(self) -> None:
        while not self._stop_event.is_set():
            if self._config.demo_mode or serial is None:
                reading = self._generate_demo_reading()
                self._process_reading(reading)
                time.sleep(1)
                continue

            try:
                if self._serial is None:
                    port = self._config.port or self._auto_detect_port()
                    if not port:
                        time.sleep(2)
                        continue
                    self._serial = serial.Serial(port=port, baudrate=self._config.baud_rate, timeout=1)

                raw = self._serial.readline().decode("utf-8", errors="ignore").strip()
                if raw:
                    reading = self._parse_line(raw)
                    if reading:
                        self._process_reading(reading)
                else:
                    time.sleep(0.1)
            except Exception:
                self._serial = None
                time.sleep(2)

    def _process_reading(self, reading: dict) -> None:
        reading.setdefault("source", "live" if not self._config.demo_mode else "demo")
        self._last_telemetry = reading
        if self._on_reading is not None:
            self._on_reading(reading)

    def _auto_detect_port(self) -> str | None:
        if list_ports is None:
            return None
        ignored_keywords = ("bluetooth", "debug", "incoming-port")
        preferred_keywords = ("arduino", "wch", "ch340", "cp210", "usb", "ttyusb", "ttyacm", "usbserial")
        for port in list_ports.comports():
            description = f"{port.description} {port.manufacturer or ''} {port.device}".lower()
            if any(keyword in description for keyword in ignored_keywords):
                continue
            if any(keyword in description for keyword in preferred_keywords):
                return port.device
        candidates = []
        for port in list_ports.comports():
            text = f"{port.description} {port.manufacturer or ''} {port.device}".lower()
            if any(keyword in text for keyword in ignored_keywords):
                continue
            candidates.append(port.device)
        return candidates[0] if candidates else None

    def _parse_line(self, raw: str) -> dict | None:
        parts = [part.strip() for part in raw.split(",")]
        if len(parts) < 6:
            return None
        _, voltage, current, rpm, temperature, windspeed = parts[:6]
        return self._build_reading(float(voltage), float(current), float(rpm), float(temperature), float(windspeed), source="live")

    def _generate_demo_reading(self) -> dict:
        windspeed = max(0.0, random.gauss(4.5, 1.2))
        rpm = max(0.0, windspeed * 70 + random.gauss(0, 12))
        voltage = max(0.0, 3.8 + windspeed * 0.45 + random.gauss(0, 0.15))
        current = max(0.0, 0.18 + windspeed * 0.05 + random.gauss(0, 0.03))
        temperature = 26 + random.gauss(0, 1.5) + windspeed * 0.6
        return self._build_reading(voltage, current, rpm, temperature, windspeed, source="demo")

    def _build_reading(self, voltage: float, current: float, rpm: float, temperature: float, windspeed: float, source: str) -> dict:
        power = round(voltage * current, 3)
        wind_input = max(0.1, windspeed * rpm * 0.02)
        efficiency = round(min(100.0, (power / wind_input) * 100.0), 2)
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "voltage": round(voltage, 3),
            "current": round(current, 3),
            "power": power,
            "rpm": round(rpm, 2),
            "windspeed": round(windspeed, 2),
            "temperature": round(temperature, 2),
            "efficiency": efficiency,
            "status": self._derive_status(voltage, current, rpm, temperature, windspeed, efficiency),
            "source": source,
        }

    def _derive_status(self, voltage: float, current: float, rpm: float, temperature: float, windspeed: float, efficiency: float) -> str:
        if windspeed < 0.5:
            return "no_wind"
        if temperature > 70:
            return "overtemperature"
        if rpm > 900:
            return "overspeed"
        if voltage < 2:
            return "low_voltage"
        if efficiency < 15:
            return "low_efficiency"
        return "healthy"
