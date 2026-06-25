import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Terminal, Play, Pause, Trash2, Download, Radio } from 'lucide-react';
import type { SensorData } from '../App';
import type { DeviceStatus } from '../lib/api';

type SerialMonitorProps = {
  sensorData: SensorData[];
  currentData: SensorData;
  isConnected: boolean;
  deviceStatus: DeviceStatus | null;
};

export function SerialMonitor({ sensorData, currentData, isConnected, deviceStatus }: SerialMonitorProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [serialLog, setSerialLog] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused && currentData) {
      const timestamp = currentData.timestamp.toLocaleTimeString();
      const logEntry = `${timestamp},${currentData.voltage.toFixed(2)},${currentData.current.toFixed(2)},${Math.round(currentData.rpm)},${currentData.temperature.toFixed(1)},${currentData.windSpeed.toFixed(1)}`;

      setSerialLog(prev => {
        const newLog = [...prev, logEntry];
        return newLog.slice(-200);
      });
    }
  }, [currentData, isPaused]);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLog, autoScroll]);

  const clearLog = () => {
    setSerialLog([]);
  };

  const downloadLog = () => {
    const content = 'TIME,VOLTAGE,CURRENT,RPM,TEMP,WINDSPEED\n' + serialLog.join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `windmill-data-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recentData = sensorData.slice(-30).map(d => ({
    time: d.timestamp.toLocaleTimeString(),
    voltage: d.voltage,
    current: d.current,
    power: d.power,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serial Monitor</h1>
          <p className="text-slate-400 mt-1">Live Arduino data stream</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="size-5 text-cyan-400" />
            <h3 className="font-semibold">Connection Info</h3>
          </div>
          <div className="space-y-3">
            <InfoRow label="Port" value={deviceStatus?.port ?? 'AUTO'} />
            <InfoRow label="Baud Rate" value={String(deviceStatus?.baud_rate ?? 9600)} />
            <InfoRow label="Firmware" value={deviceStatus?.firmware_version ?? 'unknown'} />
            <InfoRow label="Data Rate" value="1 Hz" />
            <InfoRow label="Packets" value={serialLog.length.toString()} />
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="size-5 text-cyan-400" />
            <h3 className="font-semibold">Current Reading</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ReadingCard label="Voltage" value={`${currentData.voltage.toFixed(2)} V`} color="yellow" />
            <ReadingCard label="Current" value={`${currentData.current.toFixed(2)} A`} color="blue" />
            <ReadingCard label="Power" value={`${currentData.power.toFixed(2)} W`} color="emerald" />
            <ReadingCard label="RPM" value={`${Math.round(currentData.rpm)}`} color="purple" />
            <ReadingCard label="Wind" value={`${currentData.windSpeed.toFixed(1)} m/s`} color="cyan" />
            <ReadingCard label="Temp" value={`${currentData.temperature.toFixed(1)} °C`} color="red" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Live Data Stream (Last 30 seconds)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                autoScroll ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              Auto Scroll
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={recentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="voltage"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
              name="Voltage (V)"
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Current (A)"
            />
            <Line
              type="monotone"
              dataKey="power"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Power (W)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Terminal className="size-5 text-cyan-400" />
            <h3 className="font-semibold">Serial Output</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
              {serialLog.length} lines
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2 rounded-lg transition-colors ${
                isPaused ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              onClick={clearLog}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              title="Clear Log"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              onClick={downloadLog}
              className="p-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
              title="Download CSV"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto border border-slate-800">
          <div className="text-emerald-400 mb-2">
            &gt; Serial Monitor Initialized
          </div>
          <div className="text-cyan-400 mb-2">
            &gt; Format: TIME,VOLTAGE,CURRENT,RPM,TEMP,WINDSPEED
          </div>
          <div className="text-slate-500 mb-4">
            {'─'.repeat(80)}
          </div>
          {serialLog.length === 0 ? (
            <div className="text-slate-600">Waiting for data...</div>
          ) : (
            serialLog.map((entry, index) => (
              <div key={index} className="text-slate-300 hover:bg-slate-800 px-2 py-0.5 rounded">
                <span className="text-slate-500 mr-3">{String(index + 1).padStart(4, '0')}</span>
                {entry}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Terminal className="size-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-cyan-400 mb-1">Arduino Connection Guide</h4>
            <p className="text-sm text-slate-300 mb-2">
              Connect your Arduino via USB and ensure it's sending data in CSV format:
            </p>
            <code className="text-xs bg-slate-900 text-emerald-400 px-3 py-2 rounded block font-mono">
              Serial.println(String(voltage) + "," + String(current) + "," + String(rpm) + "," + String(temp) + "," + String(windSpeed));
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function ReadingCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-700/30">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-bold text-${color}-400`}>{value}</p>
    </div>
  );
}
