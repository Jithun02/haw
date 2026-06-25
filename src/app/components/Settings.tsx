import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Monitor, Bell, Download, Database, Shield } from 'lucide-react';
import type { DeviceStatus } from '../lib/api';

type SettingsProps = {
  isConnected: boolean;
  deviceStatus: DeviceStatus | null;
  settings: Record<string, string>;
  onSave: (payload: Record<string, string>) => Promise<void>;
  onLogout: () => void;
};

export function Settings({ isConnected, deviceStatus, settings, onSave, onLogout }: SettingsProps) {
  const [theme, setTheme] = useState(settings.theme ?? 'dark');
  const [units, setUnits] = useState(settings.units ?? 'metric');
  const [refreshRate, setRefreshRate] = useState(settings.refresh_rate ?? '1');

  useEffect(() => {
    setTheme(settings.theme ?? 'dark');
    setUnits(settings.units ?? 'metric');
    setRefreshRate(settings.refresh_rate ?? '1');
  }, [settings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1">Configure application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Monitor className="size-5 text-cyan-400" />
            Display Settings
          </h3>
          <div className="space-y-4">
            <SettingRow
              label="Theme"
              description="Choose your preferred color scheme"
              control={
                <select value={theme} onChange={event => setTheme(event.target.value)} className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white">
                  <option value="dark">Dark Mode</option>
                  <option>Light Mode</option>
                  <option>Auto</option>
                </select>
              }
            />
            <SettingRow
              label="Units"
              description="Measurement system"
              control={
                <select value={units} onChange={event => setUnits(event.target.value)} className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white">
                  <option value="metric">Metric</option>
                  <option>Imperial</option>
                </select>
              }
            />
            <SettingRow
              label="Refresh Rate"
              description="Data update frequency"
              control={
                <select value={refreshRate} onChange={event => setRefreshRate(event.target.value)} className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white">
                  <option value="1">1 second</option>
                  <option>2 seconds</option>
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                </select>
              }
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Bell className="size-5 text-yellow-400" />
            Notifications
          </h3>
          <div className="space-y-3">
            <ToggleRow label="Email Notifications" enabled={true} />
            <ToggleRow label="Sound Alerts" enabled={false} />
            <ToggleRow label="Desktop Notifications" enabled={true} />
            <ToggleRow label="Critical Alerts Only" enabled={false} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Database className="size-5 text-emerald-400" />
            Data Management
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-700/30">
              <p className="text-sm text-slate-400 mb-1">Database Size</p>
              <p className="font-semibold text-lg">248.5 MB</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700/30">
              <p className="text-sm text-slate-400 mb-1">Total Records</p>
              <p className="font-semibold text-lg">1,247,890</p>
            </div>
            <button className="w-full px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">
              Clear Old Data
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Download className="size-5 text-purple-400" />
            Export Data
          </h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="size-4" />
              Export as CSV
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="size-4" />
              Export as Excel
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
              <Download className="size-4" />
              Generate PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Shield className="size-5 text-red-400" />
          Security & Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-700/30">
            <p className="text-sm text-slate-400 mb-2">Current User</p>
              <p className="font-semibold">{deviceStatus?.demo_mode ? 'Demo Operator' : 'Authenticated User'}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30">
            <p className="text-sm text-slate-400 mb-2">Role</p>
              <p className="font-semibold">{isConnected ? 'Operator' : 'Viewer'}</p>
          </div>
          <button className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">
            Change Password
          </button>
            <button onClick={onLogout} className="px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium transition-colors">
              Logout
            </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <h3 className="font-semibold text-lg mb-4">About</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-700/30">
            <p className="text-sm text-slate-400 mb-1">Application Version</p>
            <p className="font-semibold">v3.2.1</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30">
            <p className="text-sm text-slate-400 mb-1">Build Date</p>
            <p className="font-semibold">April 24, 2026</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30">
            <p className="text-sm text-slate-400 mb-1">License</p>
            <p className="font-semibold">Enterprise</p>
          </div>
            <button onClick={() => onSave({ theme, units, refresh_rate: refreshRate })} className="px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <div>
        <p className="font-medium mb-0.5">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {control}
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
      <span className="font-medium">{label}</span>
      <div
        className={`w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-emerald-500' : 'bg-slate-600'
        } relative`}
      >
        <div
          className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </div>
    </div>
  );
}
