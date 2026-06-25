import { useState } from 'react';
import { Power, Lightbulb, Fan, Settings, Radio, RefreshCw } from 'lucide-react';
import type { DeviceStatus } from '../lib/api';

type DeviceControlProps = {
  deviceStatus: DeviceStatus | null;
  onCommand: (command: string, enabled?: boolean) => Promise<void>;
};

export function DeviceControl({ deviceStatus, onCommand }: DeviceControlProps) {
  const [ledStatus, setLedStatus] = useState(false);
  const [relayStatus, setRelayStatus] = useState(false);
  const [fanMode, setFanMode] = useState(false);
  const [calibrationMode, setCalibrationMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Device Control Panel</h1>
        <p className="text-slate-400 mt-1">Remote control and configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlCard
          title="LED Indicator"
          description="Control status LED on device"
          icon={Lightbulb}
          status={ledStatus}
          onToggle={async () => {
            const next = !ledStatus;
            setLedStatus(next);
            await onCommand(next ? 'led' : 'led', next);
          }}
          color="yellow"
        />
        <ControlCard
          title="Relay Output"
          description="Control external relay switch"
          icon={Power}
          status={relayStatus}
          onToggle={async () => {
            const next = !relayStatus;
            setRelayStatus(next);
            await onCommand('relay', next);
          }}
          color="emerald"
        />
        <ControlCard
          title="Fan Simulator"
          description="Activate demo mode with simulated data"
          icon={Fan}
          status={fanMode}
          onToggle={async () => {
            const next = !fanMode;
            setFanMode(next);
            await onCommand('demo_mode', next);
          }}
          color="cyan"
        />
        <ControlCard
          title="Calibration Mode"
          description="Enter sensor calibration mode"
          icon={Settings}
          status={calibrationMode}
          onToggle={async () => {
            const next = !calibrationMode;
            setCalibrationMode(next);
            await onCommand('calibrate', next);
          }}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Radio className="size-5 text-cyan-400" />
            Connection Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">COM Port</label>
              <select className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white">
                <option>{deviceStatus?.port ?? 'AUTO / SIMULATED'}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Baud Rate</label>
              <select className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white">
                <option>{deviceStatus?.baud_rate ?? 9600}</option>
                <option>19200</option>
                <option>38400</option>
                <option>57600</option>
                <option>115200</option>
              </select>
            </div>
            <button onClick={async () => onCommand('reconnect')} className="w-full px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="size-4" />
              Reconnect Device
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Sensor Calibration</h3>
          <div className="space-y-4">
            <CalibrationControl label="Voltage Offset" value="0.00" unit="V" />
            <CalibrationControl label="Current Offset" value="0.00" unit="A" />
            <CalibrationControl label="RPM Multiplier" value="1.00" unit="x" />
            <CalibrationControl label="Wind Speed Factor" value="1.00" unit="x" />
            <button className="w-full px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors">
              Apply Calibration
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <h3 className="font-semibold text-lg mb-4">Device Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem label="Firmware Version" value="v2.1.4" />
          <InfoItem label="Hardware Revision" value="Arduino Uno R3" />
          <InfoItem label="Last Restart" value="2h 34m ago" />
          <InfoItem label="Total Uptime" value="247h 12m" />
          <InfoItem label="Data Points Logged" value="1,247,890" />
          <InfoItem label="Connection Status" value="Active" />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Settings className="size-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-cyan-400 mb-1">Pro Tip</h4>
            <p className="text-sm text-slate-300">
              Calibrate sensors regularly for optimal accuracy. Recommended calibration interval is every 30 days or after any hardware changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlCard({
  title,
  description,
  icon: Icon,
  status,
  onToggle,
  color,
}: {
  title: string;
  description: string;
  icon: any;
  status: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
          <Icon className={`size-6 text-${color}-400`} />
        </div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            status
              ? `bg-${color}-500 text-white`
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {status ? 'ON' : 'OFF'}
        </button>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

function CalibrationControl({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          defaultValue={value}
          step="0.01"
          className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
        />
        <div className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 min-w-[60px] text-center">
          {unit}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-slate-700/30">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
