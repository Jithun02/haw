import { Activity, HeartPulse, ShieldAlert, Wrench } from 'lucide-react';
import type { AnalyticsSummary, AlertItem, DeviceStatus } from '../lib/api';

type MaintenancePanelProps = {
  summary: AnalyticsSummary | null;
  alerts: AlertItem[];
  deviceStatus: DeviceStatus | null;
};

export function MaintenancePanel({ summary, alerts, deviceStatus }: MaintenancePanelProps) {
  const latestAlert = alerts[0];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maintenance Panel</h1>
        <p className="text-slate-400 mt-1">Health score, runtime trends, and service guidance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Motor Health" value={summary ? `${Math.max(0, 100 - summary.average_efficiency).toFixed(1)}%` : '—'} description="Lower is better for thermal and friction risk." icon={HeartPulse} />
        <MetricCard title="Runtime Hours" value={deviceStatus?.last_reading ? 'Live' : '—'} description="Derived from the active telemetry stream." icon={Activity} />
        <MetricCard title="Service Flag" value={latestAlert ? latestAlert.alert_type : 'Normal'} description={latestAlert ? latestAlert.message : 'No active maintenance warning.'} icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Wrench className="size-5 text-cyan-400" />
            Recommended actions
          </h3>
          <div className="space-y-3 text-sm text-slate-300">
            {(summary?.insights ?? ['Waiting for data to produce service guidance.']).map((item, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Latest alert trace</h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-slate-500 text-sm">No alerts yet.</div>
            ) : (
              alerts.slice(0, 5).map(alert => (
                <div key={`${alert.timestamp}-${alert.alert_type}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{alert.alert_type}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">{alert.severity}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: any }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <Icon className="size-8 text-cyan-400" />
      </div>
      <h3 className="text-sm text-slate-400 mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
