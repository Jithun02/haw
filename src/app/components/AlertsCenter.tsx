import { AlertTriangle, CheckCircle, Info, XCircle, Wind, Thermometer, Zap, Activity } from 'lucide-react';
import type { SensorData } from '../App';

type AlertsCenterProps = {
  currentData: SensorData;
};

export function AlertsCenter({ currentData }: AlertsCenterProps) {
  const alerts = [
    {
      id: 1,
      type: 'success',
      title: 'System Operating Normally',
      message: 'All sensors reporting within normal parameters',
      time: '2 minutes ago',
      icon: CheckCircle,
    },
    {
      id: 2,
      type: 'info',
      title: 'Wind Speed Optimal',
      message: `Current wind speed ${currentData.windSpeed.toFixed(1)} m/s is ideal for power generation`,
      time: '5 minutes ago',
      icon: Wind,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Temperature Rising',
      message: currentData.temperature > 30 ? 'Operating temperature approaching upper limit' : 'Temperature within safe range',
      time: '12 minutes ago',
      icon: Thermometer,
    },
  ];

  const systemChecks = [
    {
      name: 'Overspeed Protection',
      status: currentData.rpm < 500 ? 'normal' : 'warning',
      value: `${Math.round(currentData.rpm)} RPM`,
      threshold: '< 500 RPM',
    },
    {
      name: 'Voltage Stability',
      status: currentData.voltage > 3 && currentData.voltage < 8 ? 'normal' : 'warning',
      value: `${currentData.voltage.toFixed(2)} V`,
      threshold: '3-8 V',
    },
    {
      name: 'Temperature Monitor',
      status: currentData.temperature < 35 ? 'normal' : 'warning',
      value: `${currentData.temperature.toFixed(1)} °C`,
      threshold: '< 35 °C',
    },
    {
      name: 'Efficiency Level',
      status: currentData.efficiency > 50 ? 'normal' : 'warning',
      value: `${currentData.efficiency.toFixed(1)} %`,
      threshold: '> 50 %',
    },
    {
      name: 'Wind Availability',
      status: currentData.windSpeed > 2 ? 'normal' : 'warning',
      value: `${currentData.windSpeed.toFixed(1)} m/s`,
      threshold: '> 2 m/s',
    },
    {
      name: 'Power Output',
      status: currentData.power > 1 ? 'normal' : 'low',
      value: `${currentData.power.toFixed(2)} W`,
      threshold: '> 1 W',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts & Monitoring</h1>
        <p className="text-slate-400 mt-1">Real-time system health and notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Active Alerts"
          value="0"
          subtitle="Critical issues"
          color="red"
          icon={XCircle}
        />
        <StatCard
          title="Warnings"
          value="1"
          subtitle="Needs attention"
          color="yellow"
          icon={AlertTriangle}
        />
        <StatCard
          title="System Health"
          value="98%"
          subtitle="Overall status"
          color="emerald"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Notifications</h2>
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">System Checks</h2>
          <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
            <div className="space-y-4">
              {systemChecks.map((check, index) => (
                <SystemCheck key={index} check={check} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <h3 className="font-semibold text-lg mb-4">Alert Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AlertSetting
            title="Email Notifications"
            description="Receive alerts via email"
            enabled={true}
          />
          <AlertSetting
            title="SMS Alerts"
            description="Critical alerts via SMS"
            enabled={false}
          />
          <AlertSetting
            title="Temperature Warnings"
            description="Alert when temp exceeds 35°C"
            enabled={true}
          />
          <AlertSetting
            title="Low Wind Alerts"
            description="Notify when wind drops below 2 m/s"
            enabled={true}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: any;
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <Icon className={`size-8 text-${color}-400`} />
      </div>
      <div>
        <p className="text-sm text-slate-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold">{value}</span>
        </div>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: any }) {
  const typeStyles = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    info: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
  };

  return (
    <div className={`p-4 rounded-xl backdrop-blur-sm border ${typeStyles[alert.type as keyof typeof typeStyles]}`}>
      <div className="flex items-start gap-3">
        <alert.icon className="size-5 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium mb-1">{alert.title}</h4>
          <p className="text-sm opacity-80 mb-2">{alert.message}</p>
          <p className="text-xs opacity-60">{alert.time}</p>
        </div>
      </div>
    </div>
  );
}

function SystemCheck({ check }: { check: any }) {
  const statusColor = check.status === 'normal' ? 'emerald' : check.status === 'warning' ? 'yellow' : 'red';

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
      <div className="flex-1">
        <p className="font-medium mb-1">{check.name}</p>
        <p className="text-sm text-slate-400">Threshold: {check.threshold}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-${statusColor}-400`}>{check.value}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className={`size-2 rounded-full bg-${statusColor}-400`} />
          <span className="text-xs text-slate-400 capitalize">{check.status}</span>
        </div>
      </div>
    </div>
  );
}

function AlertSetting({ title, description, enabled }: { title: string; description: string; enabled: boolean }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg bg-slate-700/30">
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className={`size-6 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-600'} flex items-center justify-center`}>
        {enabled && <CheckCircle className="size-4 text-white" />}
      </div>
    </div>
  );
}
