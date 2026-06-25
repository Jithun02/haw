const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const API_WS_URL = import.meta.env.VITE_API_WS_URL ?? API_BASE_URL.replace(/^http/, 'ws');

export type UserInfo = {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
};

export type TelemetryPoint = {
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  rpm: number;
  windspeed: number;
  temperature: number;
  efficiency: number;
  status: string;
  source: string;
};

export type AnalyticsSummary = {
  total_energy_today_kwh: number;
  average_efficiency: number;
  peak_power_w: number;
  peak_wind_speed: number;
  best_operating_time: string;
  prediction_next_hour_power_w: number;
  predicted_daily_energy_kwh: number;
  insights: string[];
};

export type AlertItem = {
  timestamp: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
};

export type DeviceStatus = {
  connected: boolean;
  port: string | null;
  baud_rate: number;
  demo_mode: boolean;
  firmware_version: string;
  last_reading: TelemetryPoint | null;
};

const STORAGE_KEY = 'windmill_access_token';

function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string, rememberMe: boolean) {
  return request<{ access_token: string; token_type: string; user: UserInfo }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, remember_me: rememberMe }),
  });
}

export async function getMe() {
  return request<UserInfo>('/auth/me');
}

export async function getLatestTelemetry() {
  return request<TelemetryPoint>('/telemetry/latest');
}

export async function getTelemetryHistory(limit = 500) {
  return request<{ items: TelemetryPoint[]; count: number }>(`/telemetry/history?limit=${limit}`);
}

export async function getAnalyticsSummary() {
  return request<AnalyticsSummary>('/analytics/summary');
}

export async function getAlerts() {
  return request<{ items: AlertItem[] }>('/alerts');
}

export async function getDeviceStatus() {
  return request<DeviceStatus>('/device/status');
}

export async function getDevicePorts() {
  return request<{ items: { device: string; description: string | null; manufacturer: string | null }[] }>('/device/ports');
}

export async function sendDeviceCommand(command: string, enabled?: boolean, payload: Record<string, string | number | boolean> = {}) {
  return request('/device/control', {
    method: 'POST',
    body: JSON.stringify({ command, enabled, payload }),
  });
}

export async function updateDeviceConfig(payload: Record<string, unknown>) {
  return request('/device/config', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getSettings() {
  return request<{ theme: string; units: string; refresh_rate: string }>('/settings');
}

export async function updateSettings(payload: Record<string, unknown>) {
  return request('/settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getExportUrl(format: 'csv' | 'excel' | 'pdf') {
  return `${API_BASE_URL}/export/${format}`;
}

export async function downloadExport(format: 'csv' | 'excel' | 'pdf') {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/export/${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `windmill-report.${format === 'excel' ? 'xlsx' : format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export { API_BASE_URL, API_WS_URL, STORAGE_KEY };
