import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveCharts } from './components/LiveCharts';
import { VoltageAnalysis } from './components/VoltageAnalysis';
import { PowerAnalysis } from './components/PowerAnalysis';
import { WindmillVisualizer } from './components/WindmillVisualizer';
import { Analytics } from './components/Analytics';
import { AlertsCenter } from './components/AlertsCenter';
import { DeviceControl } from './components/DeviceControl';
import { SerialMonitor } from './components/SerialMonitor';
import { Settings } from './components/Settings';
import { LoginScreen } from './components/LoginScreen';
import { ExportCenter } from './components/ExportCenter';
import { MaintenancePanel } from './components/MaintenancePanel';
import {
  API_WS_URL,
  clearToken,
  getAlerts,
  getAnalyticsSummary,
  getDeviceStatus,
  getLatestTelemetry,
  getMe,
  getSettings,
  getTelemetryHistory,
  login,
  sendDeviceCommand,
  setToken,
  updateSettings,
  type AlertItem,
  type AnalyticsSummary,
  type DeviceStatus,
  type TelemetryPoint,
  type UserInfo,
} from './lib/api';

export type SensorData = {
  timestamp: Date;
  voltage: number;
  current: number;
  power: number;
  rpm: number;
  windSpeed: number;
  temperature: number;
  efficiency: number;
};

const EMPTY_SENSOR: SensorData = {
  timestamp: new Date(),
  voltage: 0,
  current: 0,
  power: 0,
  rpm: 0,
  windSpeed: 0,
  temperature: 25,
  efficiency: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [currentData, setCurrentData] = useState<SensorData>(EMPTY_SENSOR);
  const [isConnected, setIsConnected] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [settingsState, setSettingsState] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const tokenInitialized = useMemo(() => localStorage.getItem('windmill_access_token') !== null, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        if (!tokenInitialized) {
          setAuthReady(true);
          return;
        }

        const [me, telemetry, analytics, alertResponse, device, settingResponse, history] = await Promise.all([
          getMe(),
          getLatestTelemetry(),
          getAnalyticsSummary(),
          getAlerts(),
          getDeviceStatus(),
          getSettings(),
          getTelemetryHistory(120),
        ]);

        if (cancelled) {
          return;
        }

        setUser(me);
        setCurrentData(mapTelemetry(telemetry));
        setSensorData(history.items.map(mapTelemetry));
        setSummary(analytics);
        setAlerts(alertResponse.items);
        setDeviceStatus(device);
        setSettingsState(settingResponse);
        setIsConnected(device.connected);
      } catch {
        clearToken();
        if (!cancelled) {
          setUser(null);
          setLoginError('Session expired. Sign in again.');
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [tokenInitialized]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const websocket = new WebSocket(`${API_WS_URL}/ws/telemetry`);

    websocket.onopen = () => setIsConnected(true);
    websocket.onmessage = event => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; data?: TelemetryPoint };
        if (payload.type === 'telemetry' && payload.data) {
          const mapped = mapTelemetry(payload.data);
          setCurrentData(mapped);
          setSensorData(prev => [...prev.slice(-119), mapped]);
          setIsConnected(true);
        }
      } catch {
        
      }
    };
    websocket.onerror = () => setIsConnected(false);
    websocket.onclose = () => setIsConnected(false);

    return () => websocket.close();
  }, [user]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await login(email, password, rememberMe);
      setToken(response.access_token);
      setUser(response.user);
      const [telemetry, analytics, alertResponse, device, settingResponse, history] = await Promise.all([
        getLatestTelemetry(),
        getAnalyticsSummary(),
        getAlerts(),
        getDeviceStatus(),
        getSettings(),
        getTelemetryHistory(120),
      ]);
      setCurrentData(mapTelemetry(telemetry));
      setSensorData(history.items.map(mapTelemetry));
      setSummary(analytics);
      setAlerts(alertResponse.items);
      setDeviceStatus(device);
      setSettingsState(settingResponse);
      setIsConnected(device.connected);
      setActiveTab('dashboard');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setActiveTab('dashboard');
    setSensorData([]);
    setCurrentData(EMPTY_SENSOR);
    setSummary(null);
    setAlerts([]);
    setDeviceStatus(null);
    setSettingsState({});
    setIsConnected(false);
  };

  const handleDeviceCommand = async (command: string, enabled?: boolean) => {
    await sendDeviceCommand(command, enabled);
    const status = await getDeviceStatus();
    setDeviceStatus(status);
    setIsConnected(status.connected);
  };

  const handleSettingsSave = async (payload: Record<string, string>) => {
    await updateSettings(payload);
    const updated = await getSettings();
    setSettingsState(updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard currentData={currentData} isConnected={isConnected} summary={summary} user={user} />;
      case 'charts':
        return <LiveCharts sensorData={sensorData} />;
      case 'voltage':
        return <VoltageAnalysis sensorData={sensorData} currentData={currentData} />;
      case 'power':
        return <PowerAnalysis sensorData={sensorData} currentData={currentData} />;
      case 'visualizer':
        return <WindmillVisualizer currentData={currentData} />;
      case 'analytics':
        return <Analytics sensorData={sensorData} />;
      case 'alerts':
        return <AlertsCenter currentData={currentData} />;
      case 'control':
        return <DeviceControl deviceStatus={deviceStatus} onCommand={handleDeviceCommand} />;
      case 'monitor':
        return <SerialMonitor sensorData={sensorData} currentData={currentData} isConnected={isConnected} deviceStatus={deviceStatus} />;
      case 'maintenance':
        return <MaintenancePanel summary={summary} alerts={alerts} deviceStatus={deviceStatus} />;
      case 'export':
        return <ExportCenter />;
      case 'settings':
        return <Settings isConnected={isConnected} deviceStatus={deviceStatus} settings={settingsState} onSave={handleSettingsSave} onLogout={handleLogout} />;
      default:
        return <Dashboard currentData={currentData} isConnected={isConnected} summary={summary} user={user} />;
    }
  };

  if (!authReady) {
    return <div className="size-full bg-slate-950" />;
  }

  if (!user) {
    return <LoginScreen loading={loginLoading} error={loginError} onLogin={handleLogin} />;
  }

  return (
    <div className="size-full flex bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#030712_50%,#020617_100%)] text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isConnected={isConnected} user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="relative p-6 md:p-8 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function mapTelemetry(point: TelemetryPoint): SensorData {
  return {
    timestamp: new Date(point.timestamp),
    voltage: point.voltage,
    current: point.current,
    power: point.power,
    rpm: point.rpm,
    windSpeed: point.windspeed,
    temperature: point.temperature,
    efficiency: point.efficiency,
  };
}
