import { Zap, Activity, Gauge, Wind, Thermometer, TrendingUp, Battery, Clock } from 'lucide-react';
import type { SensorData } from '../App';
import type { AnalyticsSummary, UserInfo } from '../lib/api';

type DashboardProps = {
  currentData: SensorData;
  isConnected: boolean;
  summary: AnalyticsSummary | null;
  user: UserInfo | null;
};

export function Dashboard({ currentData, isConnected, summary, user }: DashboardProps) {
  const metrics = [
    {
      label: 'Voltage',
      value: currentData.voltage.toFixed(2),
      unit: 'V',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      label: 'Current',
      value: currentData.current.toFixed(2),
      unit: 'A',
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Power Output',
      value: currentData.power.toFixed(2),
      unit: 'W',
      icon: Zap,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'RPM',
      value: Math.round(currentData.rpm).toString(),
      unit: 'RPM',
      icon: Gauge,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      label: 'Wind Speed',
      value: currentData.windSpeed.toFixed(1),
      unit: 'm/s',
      icon: Wind,
      color: 'from-cyan-500 to-teal-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      label: 'Temperature',
      value: currentData.temperature.toFixed(1),
      unit: '°C',
      icon: Thermometer,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      label: 'Efficiency',
      value: currentData.efficiency.toFixed(1),
      unit: '%',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Energy Today',
      value: summary ? summary.total_energy_today_kwh.toFixed(2) : '0.00',
      unit: 'kWh',
      icon: Battery,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Monitoring</h1>
          <p className="text-slate-400 mt-1">Live windmill performance data {user ? `for ${user.full_name}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <Clock className="size-4 text-cyan-400" />
          <span className="text-sm text-slate-300">
            {currentData.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {!isConnected && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-medium">Device Disconnected</p>
          <p className="text-sm text-red-400/80 mt-1">Check Arduino connection and try again.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl backdrop-blur-sm border ${metric.bgColor} ${metric.borderColor} hover:border-opacity-40 transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color}`}>
                <metric.icon className="size-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metric.value}</span>
                <span className="text-lg text-slate-400">{metric.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-400" />
            System Status
          </h3>
          <div className="space-y-3">
            <StatusItem label="Turbine" status={isConnected ? 'Operational' : 'Offline'} color={isConnected ? 'emerald' : 'red'} />
            <StatusItem label="Sensors" status={currentData.windSpeed > 0 ? 'All Active' : 'Waiting'} color="emerald" />
            <StatusItem label="Data Logging" status={summary ? 'Recording' : 'Starting'} color="cyan" />
            <StatusItem label="Health Score" status={summary ? `${Math.max(0, 100 - summary.average_efficiency).toFixed(1)}%` : 'Pending'} color="emerald" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-cyan-400" />
            Performance Insights
          </h3>
          <div className="space-y-3">
            <InsightItem text={summary?.insights[0] ?? 'Wind conditions optimal'} icon="✓" color="emerald" />
            <InsightItem text={summary?.insights[1] ?? 'Operating at peak efficiency'} icon="↑" color="cyan" />
            <InsightItem text={summary?.insights[2] ?? 'All systems nominal'} icon="✓" color="emerald" />
            <InsightItem text={`Next hour forecast: ${summary ? summary.prediction_next_hour_power_w.toFixed(2) : '0.00'} W`} icon="→" color="blue" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-purple-400" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            <QuickStat label="Uptime Today" value="8h 42m" />
            <QuickStat label="Peak Power" value={summary ? `${summary.peak_power_w.toFixed(2)} W` : '0.00 W'} />
            <QuickStat label="Avg Efficiency" value={summary ? `${summary.average_efficiency.toFixed(1)}%` : '0.0%'} />
            <QuickStat label="Best Time" value={summary?.best_operating_time ?? '--:--'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-medium text-${color}-400`}>{status}</span>
    </div>
  );
}

function InsightItem({ text, icon, color }: { text: string; icon: string; color: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className={`text-${color}-400 font-bold`}>{icon}</span>
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
