import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from 'recharts';
import { Zap, Battery, TrendingUp, Award, Wind, Cpu } from 'lucide-react';
import type { SensorData } from '../App';

type PowerAnalysisProps = {
  sensorData: SensorData[];
  currentData: SensorData;
};

export function PowerAnalysis({ sensorData, currentData }: PowerAnalysisProps) {
  const [powerMetrics, setPowerMetrics] = useState({
    instantPower: 0,
    avgPower: 0,
    peakPower: 0,
    energyToday: 0,
    capacityFactor: 0,
    powerCoefficient: 0,
  });

  useEffect(() => {
    if (sensorData.length > 0) {
      const powers = sensorData.map(d => d.power);
      const avgPower = powers.reduce((sum, p) => sum + p, 0) / powers.length;
      const peakPower = Math.max(...powers);

      
      const energyToday = (avgPower * sensorData.length) / 3600; 

      
      const capacityFactor = (avgPower / (peakPower || 1)) * 100;

      
      const windPower = 0.5 * 1.225 * Math.PI * 0.25 * Math.pow(currentData.windSpeed, 3);
      const powerCoefficient = windPower > 0 ? (currentData.power / windPower) * 100 : 0;

      setPowerMetrics({
        instantPower: currentData.power,
        avgPower,
        peakPower,
        energyToday,
        capacityFactor,
        powerCoefficient: Math.min(59.3, powerCoefficient), 
      });
    }
  }, [sensorData, currentData]);

  const powerTimeSeries = sensorData.slice(-60).map(d => ({
    time: d.timestamp.toLocaleTimeString(),
    power: d.power,
    voltage: d.voltage,
    current: d.current,
    efficiency: d.efficiency,
  }));

  const powerWindRelation = sensorData.slice(-50).map(d => ({
    windSpeed: d.windSpeed,
    power: d.power,
    theoretical: 0.5 * 1.225 * Math.PI * 0.25 * Math.pow(d.windSpeed, 3) * 0.4,
  }));

  const energyAccumulation = [];
  let cumulativeEnergy = 0;
  sensorData.slice(-120).forEach((d, idx) => {
    cumulativeEnergy += d.power / 3600;
    if (idx % 10 === 0) {
      energyAccumulation.push({
        time: d.timestamp.toLocaleTimeString(),
        energy: cumulativeEnergy,
      });
    }
  });

  const efficiencyAnalysis = sensorData.slice(-40).map(d => ({
    rpm: d.rpm,
    efficiency: d.efficiency,
    power: d.power,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Power & Energy Analysis</h1>
        <p className="text-slate-400 mt-1">Comprehensive power generation analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PowerMetricCard
          title="Instant Power"
          value={powerMetrics.instantPower.toFixed(3)}
          unit="W"
          icon={Zap}
          color="yellow"
          trend="+12%"
        />
        <PowerMetricCard
          title="Average Power"
          value={powerMetrics.avgPower.toFixed(3)}
          unit="W"
          icon={TrendingUp}
          color="cyan"
          trend="+8%"
        />
        <PowerMetricCard
          title="Peak Power"
          value={powerMetrics.peakPower.toFixed(3)}
          unit="W"
          icon={Award}
          color="emerald"
          trend="Record"
        />
        <PowerMetricCard
          title="Energy Today"
          value={powerMetrics.energyToday.toFixed(2)}
          unit="Wh"
          icon={Battery}
          color="purple"
          trend="+15%"
        />
        <PowerMetricCard
          title="Capacity Factor"
          value={powerMetrics.capacityFactor.toFixed(1)}
          unit="%"
          icon={Cpu}
          color="blue"
          trend="Good"
        />
        <PowerMetricCard
          title="Power Coefficient"
          value={powerMetrics.powerCoefficient.toFixed(1)}
          unit="%"
          icon={Wind}
          color="green"
          trend={`${(powerMetrics.powerCoefficient / 59.3 * 100).toFixed(0)}% of Betz`}
        />
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="size-5 text-yellow-400" />
          <h3 className="font-semibold text-lg">Real-Time Power Output</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={powerTimeSeries}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="power"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#powerGradient)"
              name="Power (W)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Wind className="size-5 text-cyan-400" />
            <h3 className="font-semibold text-lg">Power vs Wind Speed Curve</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={powerWindRelation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="windSpeed"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Wind Speed (m/s)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
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
                dataKey="power"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                name="Actual Power"
              />
              <Line
                type="monotone"
                dataKey="theoretical"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Theoretical"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Battery className="size-5 text-purple-400" />
            <h3 className="font-semibold text-lg">Cumulative Energy</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={energyAccumulation}>
              <defs>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#energyGradient)"
                name="Energy (Wh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="size-5 text-emerald-400" />
          <h3 className="font-semibold text-lg">Power-Voltage-Current Correlation</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={powerTimeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
            <Bar
              yAxisId="left"
              dataKey="power"
              fill="#10b981"
              opacity={0.6}
              name="Power (W)"
            />
            <Line
              yAxisId="right"
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Power Quality Metrics</h3>
          <div className="space-y-4">
            <MetricRow
              label="Power Stability"
              value={`${(100 - (Math.abs(powerMetrics.instantPower - powerMetrics.avgPower) / powerMetrics.avgPower * 100)).toFixed(1)}%`}
              status="good"
            />
            <MetricRow
              label="Load Efficiency"
              value={`${currentData.efficiency.toFixed(1)}%`}
              status={currentData.efficiency > 60 ? 'good' : 'warning'}
            />
            <MetricRow
              label="Power Utilization"
              value={`${powerMetrics.capacityFactor.toFixed(1)}%`}
              status={powerMetrics.capacityFactor > 50 ? 'good' : 'warning'}
            />
            <MetricRow
              label="Generator Performance"
              value={`${((powerMetrics.powerCoefficient / 59.3) * 100).toFixed(1)}%`}
              status={powerMetrics.powerCoefficient > 30 ? 'good' : 'warning'}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Energy Projections</h3>
          <div className="space-y-3">
            <ProjectionCard
              period="Next Hour"
              value={(powerMetrics.avgPower * 1).toFixed(2)}
              unit="Wh"
              icon="⏱️"
            />
            <ProjectionCard
              period="Today (24h)"
              value={(powerMetrics.avgPower * 24).toFixed(2)}
              unit="Wh"
              icon="📅"
            />
            <ProjectionCard
              period="This Week"
              value={(powerMetrics.avgPower * 24 * 7 / 1000).toFixed(3)}
              unit="kWh"
              icon="📊"
            />
            <ProjectionCard
              period="This Month"
              value={(powerMetrics.avgPower * 24 * 30 / 1000).toFixed(3)}
              unit="kWh"
              icon="📈"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <Award className="size-5 text-emerald-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-emerald-400 mb-2">Performance Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
              <div>
                • Current power coefficient: <strong className="text-emerald-400">{powerMetrics.powerCoefficient.toFixed(1)}%</strong> (Betz limit: 59.3%)
              </div>
              <div>
                • Operating at <strong className="text-cyan-400">{powerMetrics.capacityFactor.toFixed(0)}%</strong> capacity factor
              </div>
              <div>
                • Generated <strong className="text-purple-400">{powerMetrics.energyToday.toFixed(2)} Wh</strong> today
              </div>
              <div>
                • Efficiency rating: <strong className={currentData.efficiency > 60 ? 'text-emerald-400' : 'text-yellow-400'}>
                  {currentData.efficiency > 60 ? 'Excellent' : 'Good'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PowerMetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  unit: string;
  icon: any;
  color: string;
  trend: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
          <Icon className={`size-6 text-${color}-400`} />
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
          {trend}
        </span>
      </div>
      <h3 className="text-sm text-slate-400 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-lg text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${status === 'good' ? 'text-emerald-400' : 'text-yellow-400'}`}>
          {value}
        </span>
        <div className={`size-2 rounded-full ${status === 'good' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
      </div>
    </div>
  );
}

function ProjectionCard({
  period,
  value,
  unit,
  icon,
}: {
  period: string;
  value: string;
  unit: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-slate-300">{period}</span>
      </div>
      <div className="text-right">
        <span className="font-bold text-lg">{value}</span>
        <span className="text-slate-400 ml-1">{unit}</span>
      </div>
    </div>
  );
}
