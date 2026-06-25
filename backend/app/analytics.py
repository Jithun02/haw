from __future__ import annotations

from statistics import mean
from datetime import datetime


def compute_summary(rows: list[dict]) -> dict:
    if not rows:
        return {
            "total_energy_today_kwh": 0.0,
            "average_efficiency": 0.0,
            "peak_power_w": 0.0,
            "peak_wind_speed": 0.0,
            "best_operating_time": "--:--",
            "prediction_next_hour_power_w": 0.0,
            "predicted_daily_energy_kwh": 0.0,
            "insights": ["Waiting for telemetry from the Arduino or simulator."],
        }

    total_energy_kwh = sum(row["power"] for row in rows) / 3600.0 / 1000.0
    average_efficiency = mean(row["efficiency"] for row in rows)
    peak_power = max(row["power"] for row in rows)
    peak_wind = max(row["windspeed"] for row in rows)
    best_row = max(rows, key=lambda row: row["efficiency"])
    predicted_power = _forecast_next_hour_power(rows)
    daily_prediction = max(total_energy_kwh, predicted_power * 3600.0 / 1000.0)

    insights = _build_insights(rows, predicted_power)

    return {
        "total_energy_today_kwh": round(total_energy_kwh, 3),
        "average_efficiency": round(average_efficiency, 2),
        "peak_power_w": round(peak_power, 2),
        "peak_wind_speed": round(peak_wind, 2),
        "best_operating_time": datetime.fromisoformat(best_row["timestamp"]).strftime("%H:%M"),
        "prediction_next_hour_power_w": round(predicted_power, 2),
        "predicted_daily_energy_kwh": round(daily_prediction, 3),
        "insights": insights,
    }


def build_alerts(rows: list[dict]) -> list[dict]:
    alerts: list[dict] = []
    if not rows:
        return alerts

    latest = rows[-1]
    if latest["windspeed"] < 0.5:
        alerts.append(_alert(latest["timestamp"], "no_wind", "warning", "No usable wind detected"))
    if latest["rpm"] > 900:
        alerts.append(_alert(latest["timestamp"], "overspeed", "critical", "Rotor speed above safe limit"))
    if latest["temperature"] > 70:
        alerts.append(_alert(latest["timestamp"], "overtemperature", "critical", "Generator temperature is high"))
    if latest["voltage"] < 2:
        alerts.append(_alert(latest["timestamp"], "low_voltage", "warning", "Output voltage is low"))
    if latest["efficiency"] < 15 and latest["windspeed"] > 3:
        alerts.append(_alert(latest["timestamp"], "low_efficiency", "warning", "Wind available but conversion is weak"))

    if len(rows) >= 4:
        recent_rpm = [row["rpm"] for row in rows[-4:]]
        if max(recent_rpm) - min(recent_rpm) > 120 and recent_rpm[-1] < mean(recent_rpm[:-1]):
            alerts.append(_alert(latest["timestamp"], "rpm_instability", "warning", "RPM instability detected"))

    return alerts


def _build_insights(rows: list[dict], predicted_power: float) -> list[str]:
    latest = rows[-1]
    insights = []
    if latest["windspeed"] > 4 and latest["efficiency"] > 50:
        insights.append("Wind conditions are sufficient for battery charging.")
    if latest["rpm"] < 50 and latest["windspeed"] > 3:
        insights.append("RPM is lower than expected; check blade angle or friction.")
    if latest["temperature"] > 55:
        insights.append("Clean the motor shaft and inspect cooling path.")
    if predicted_power > latest["power"] * 1.2:
        insights.append("Power output is likely to improve within the next hour.")
    if not insights:
        insights.append("System is operating within nominal range.")
    return insights


def _forecast_next_hour_power(rows: list[dict]) -> float:
    window = rows[-20:] if len(rows) > 20 else rows
    if len(window) < 2:
        return window[-1]["power"] if window else 0.0

    x_values = list(range(len(window)))
    y_values = [row["power"] for row in window]
    x_mean = mean(x_values)
    y_mean = mean(y_values)
    denominator = sum((x - x_mean) ** 2 for x in x_values)
    if denominator == 0:
        return y_values[-1]
    slope = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, y_values)) / denominator
    projected = y_values[-1] + slope * 12
    return max(0.0, projected)


def _alert(timestamp: str, alert_type: str, severity: str, message: str) -> dict:
    return {
        "timestamp": timestamp,
        "alert_type": alert_type,
        "severity": severity,
        "message": message,
    }
