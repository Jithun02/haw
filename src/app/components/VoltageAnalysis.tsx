import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Zap, Activity, TrendingUp, AlertTriangle, Gauge, BarChart3, Radio, Database } from 'lucide-react';
import type { SensorData } from '../App';

type VoltageAnalysisProps = {
  sensorData: SensorData[];
  currentData: SensorData;
};

export function VoltageAnalysis({ sensorData, currentData }: VoltageAnalysisProps) {
  const [voltageStats, setVoltageStats] = useState({
    min: 0,
    max: 0,
    avg: 0,
    peak: 0,
    rms: 0,
    ripple: 0,
    stability: 0,
  });

  const [powerQuality, setPowerQuality] = useState({
    powerFactor: 0,
    efficiency: 0,
    regulation: 0,
    harmonicDistortion: 0,
  });

  useEffect(() => {
    if (sensorData.length > 0) {
      const voltages = sensorData.map(d => d.voltage);
      const min = Math.min(...voltages);
      const max = Math.max(...voltages);
      const avg = voltages.reduce((sum, v) => sum + v, 0) / voltages.length;

      
      const rms = Math.sqrt(voltages.reduce((sum, v) => sum + v * v, 0) / voltages.length);

      
      const ripple = ((max - min) / avg) * 100;

      
      const stdDev = Math.sqrt(voltages.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / voltages.length);
      const stability = Math.max(0, 100 - (stdDev / avg) * 100);

      setVoltageStats({
        min,
        max,
        avg,
        peak: max,
        rms,
        ripple,
        stability,
      });

      
      const powerFactor = 0.85 + Math.random() * 0.12;
      const efficiency = currentData.efficiency;
      const regulation = Math.max(0, 100 - ripple);
      const harmonicDistortion = ripple * 0.3;

      setPowerQuality({
        powerFactor,
        efficiency,
        regulation,
        harmonicDistortion,
      });
    }
  }, [sensorData, currentData]);

  const recentVoltageData = sensorData.slice(-60).map((d, idx) => ({
    time: d.timestamp.toLocaleTimeString(),
    voltage: d.voltage,
    current: d.current,
    power: d.power,
    avgVoltage: voltageStats.avg,
    minThreshold: 4.0,
    maxThreshold: 7.0,
  }));

  const voltageDistribution = [];
  const buckets = [0, 3, 4, 5, 6, 7, 8, 10];
  for (let i = 0; i < buckets.length - 1; i++) {
    const count = sensorData.filter(d => d.voltage >= buckets[i] && d.voltage < buckets[i + 1]).length;
    voltageDistribution.push({
      range: `${buckets[i]}-${buckets[i + 1]}V`,
      count,
      percentage: sensorData.length > 0 ? (count / sensorData.length) * 100 : 0,
    });
  }

  const loadAnalysis = sensorData.slice(-30).map(d => ({
    time: d.timestamp.toLocaleTimeString(),
    resistance: d.voltage > 0 ? d.voltage / (d.current + 0.01) : 0,
    powerOutput: d.power,
  }));

  const voltageCurrentRelation = sensorData.slice(-50).map(d => ({
    voltage: d.voltage,
    current: d.current,
    rpm: d.rpm,
  }));

  const generatorPerformance = sensorData.slice(-40).map((d, idx) => ({
    rpm: d.rpm,
    voltage: d.voltage,
    power: d.power,
    efficiency: d.efficiency,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Voltage Analysis Dashboard</h1>
        <p className="text-slate-400 mt-1">Advanced real-time voltage monitoring and analytics</p>
      </div>

      { }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Voltage"
          value={currentData.voltage.toFixed(3)}
          unit="V"
          icon={Zap}
          color="yellow"
          subtitle={`${voltageStats.stability.toFixed(1)}% stable`}
        />
        <MetricCard
          title="RMS Voltage"
          value={voltageStats.rms.toFixed(3)}
          unit="V"
          icon={Activity}
          color="cyan"
          subtitle="Root Mean Square"
        />
        <MetricCard
          title="Peak Voltage"
          value={voltageStats.peak.toFixed(3)}
          unit="V"
          icon={TrendingUp}
          color="emerald"
          subtitle={`Max: ${voltageStats.max.toFixed(2)}V`}
        />
        <MetricCard
          title="Voltage Ripple"
          value={voltageStats.ripple.toFixed(2)}
          unit="%"
          icon={AlertTriangle}
          color={voltageStats.ripple > 15 ? 'red' : 'green'}
          subtitle={voltageStats.ripple > 15 ? 'High ripple' : 'Normal'}
        />
      </div>

      { }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QualityCard
          title="Power Factor"
          value={powerQuality.powerFactor.toFixed(3)}
          target="0.85-0.97"
          color="purple"
          status={powerQuality.powerFactor > 0.85 ? 'good' : 'warning'}
        />
        <QualityCard
          title="Regulation"
          value={`${powerQuality.regulation.toFixed(1)}%`}
          target=">85%"
          color="cyan"
          status={powerQuality.regulation > 85 ? 'good' : 'warning'}
        />
        <QualityCard
          title="Efficiency"
          value={`${powerQuality.efficiency.toFixed(1)}%`}
          target=">60%"
          color="emerald"
          status={powerQuality.efficiency > 60 ? 'good' : 'warning'}
        />
        <QualityCard
          title="THD"
          value={`${powerQuality.harmonicDistortion.toFixed(2)}%`}
          target="<5%"
          color="orange"
          status={powerQuality.harmonicDistortion < 5 ? 'good' : 'warning'}
        />
      </div>

      { }
      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-cyan-400" />
            <h3 className="font-semibold text-lg">Live Voltage Waveform Analysis</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-yellow-400" />
              <span className="text-slate-300">Voltage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Average</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={recentVoltageData}>
            <defs>
              <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="3 3" label="Min" />
            <ReferenceLine y={7.0} stroke="#ef4444" strokeDasharray="3 3" label="Max" />
            <ReferenceLine y={voltageStats.avg} stroke="#06b6d4" strokeDasharray="5 5" label="Avg" />
            <Area
              type="monotone"
              dataKey="voltage"
              stroke="#facc15"
              strokeWidth={2}
              fill="url(#voltageGradient)"
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        { }
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="size-5 text-purple-400" />
            <h3 className="font-semibold text-lg">V-I Characteristics</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recentVoltageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                yAxisId="left"
                stroke="#facc15"
                tick={{ fill: '#facc15', fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3b82f6"
                tick={{ fill: '#3b82f6', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="voltage"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
                name="Voltage (V)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="current"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Current (A)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        { }
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="size-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Voltage Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={voltageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="range"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
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
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        { }
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="size-5 text-cyan-400" />
            <h3 className="font-semibold text-lg">RPM vs Voltage Curve</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generatorPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="rpm"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'RPM', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="voltage"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        { }
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Database className="size-5 text-purple-400" />
            <h3 className="font-semibold text-lg">Load Resistance Analysis</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={loadAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
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
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="resistance"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
                name="Resistance (Ω)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      { }
      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <h3 className="font-semibold text-lg mb-4">Statistical Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatBox label="Minimum" value={`${voltageStats.min.toFixed(3)} V`} />
          <StatBox label="Maximum" value={`${voltageStats.max.toFixed(3)} V`} />
          <StatBox label="Average" value={`${voltageStats.avg.toFixed(3)} V`} />
          <StatBox label="RMS" value={`${voltageStats.rms.toFixed(3)} V`} />
          <StatBox label="Peak-to-Peak" value={`${(voltageStats.max - voltageStats.min).toFixed(3)} V`} />
          <StatBox label="Stability" value={`${voltageStats.stability.toFixed(1)}%`} />
        </div>
      </div>

      { }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Voltage Diagnostics</h3>
          <div className="space-y-3">
            <DiagnosticItem
              label="Overvoltage Protection"
              status={currentData.voltage < 7.5 ? 'normal' : 'warning'}
              value={`${currentData.voltage.toFixed(2)} V`}
              threshold="< 7.5 V"
            />
            <DiagnosticItem
              label="Undervoltage Protection"
              status={currentData.voltage > 3.5 ? 'normal' : 'warning'}
              value={`${currentData.voltage.toFixed(2)} V`}
              threshold="> 3.5 V"
            />
            <DiagnosticItem
              label="Voltage Stability"
              status={voltageStats.stability > 80 ? 'normal' : 'warning'}
              value={`${voltageStats.stability.toFixed(1)}%`}
              threshold="> 80%"
            />
            <DiagnosticItem
              label="Ripple Factor"
              status={voltageStats.ripple < 15 ? 'normal' : 'warning'}
              value={`${voltageStats.ripple.toFixed(2)}%`}
              threshold="< 15%"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Generator Health</h3>
          <div className="space-y-4">
            <HealthBar label="Voltage Output" value={75} color="yellow" />
            <HealthBar label="Load Matching" value={82} color="cyan" />
            <HealthBar label="Power Quality" value={powerQuality.regulation} color="emerald" />
            <HealthBar label="Efficiency" value={powerQuality.efficiency} color="purple" />
          </div>
        </div>
      </div>

      { }
      <div className="p-6 rounded-2xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Zap className="size-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-cyan-400 mb-2">Smart Voltage Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
              <div>
                • Generator operating at <strong className="text-cyan-400">{voltageStats.stability.toFixed(0)}% stability</strong>
              </div>
              <div>
                • Voltage ripple is <strong className={voltageStats.ripple < 10 ? 'text-emerald-400' : 'text-yellow-400'}>
                  {voltageStats.ripple.toFixed(1)}%</strong> {voltageStats.ripple < 10 ? '(Excellent)' : '(Acceptable)'}
              </div>
              <div>
                • Power factor: <strong className="text-purple-400">{powerQuality.powerFactor.toFixed(3)}</strong> (Good for DC generation)
              </div>
              <div>
                • Recommended load: <strong className="text-emerald-400">
                  {(currentData.voltage / 5 * 100).toFixed(0)}Ω</strong> for maximum power transfer
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
          <Icon className={`size-6 text-${color}-400`} />
        </div>
      </div>
      <h3 className="text-sm text-slate-400 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-lg text-slate-400">{unit}</span>
      </div>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function QualityCard({
  title,
  value,
  target,
  color,
  status,
}: {
  title: string;
  value: string;
  target: string;
  color: string;
  status: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm text-slate-400">{title}</h4>
        <div className={`size-2 rounded-full ${status === 'good' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
      </div>
      <p className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</p>
      <p className="text-xs text-slate-500">Target: {target}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-slate-700/30">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function DiagnosticItem({
  label,
  status,
  value,
  threshold,
}: {
  label: string;
  status: string;
  value: string;
  threshold: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <div>
        <p className="font-medium mb-1">{label}</p>
        <p className="text-xs text-slate-400">Threshold: {threshold}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${status === 'normal' ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`size-2 rounded-full ${status === 'normal' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
          <span className="text-xs text-slate-400 capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}

function HealthBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-sm font-semibold text-${color}-400`}>{value.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-400 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
