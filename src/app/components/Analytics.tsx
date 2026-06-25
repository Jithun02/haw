import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Zap } from 'lucide-react';
import type { SensorData } from '../App';

type AnalyticsProps = {
  sensorData: SensorData[];
};

export function Analytics({ sensorData }: AnalyticsProps) {
  const hourlyData = [
    { hour: '00:00', energy: 0.8 },
    { hour: '03:00', energy: 0.6 },
    { hour: '06:00', energy: 1.2 },
    { hour: '09:00', energy: 2.4 },
    { hour: '12:00', energy: 3.2 },
    { hour: '15:00', energy: 2.8 },
    { hour: '18:00', energy: 2.1 },
    { hour: '21:00', energy: 1.5 },
  ];

  const weeklyData = [
    { day: 'Mon', energy: 18.5 },
    { day: 'Tue', energy: 21.2 },
    { day: 'Wed', energy: 19.8 },
    { day: 'Thu', energy: 22.4 },
    { day: 'Fri', energy: 20.1 },
    { day: 'Sat', energy: 17.6 },
    { day: 'Sun', energy: 16.8 },
  ];

  const performanceData = [
    { name: 'Optimal', value: 68, color: '#10b981' },
    { name: 'Good', value: 22, color: '#3b82f6' },
    { name: 'Fair', value: 8, color: '#f59e0b' },
    { name: 'Poor', value: 2, color: '#ef4444' },
  ];

  const avgVoltage = sensorData.length > 0
    ? (sensorData.reduce((sum, d) => sum + d.voltage, 0) / sensorData.length).toFixed(2)
    : '0.00';

  const avgEfficiency = sensorData.length > 0
    ? (sensorData.reduce((sum, d) => sum + d.efficiency, 0) / sensorData.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-slate-400 mt-1">Performance trends and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard
          title="Today's Generation"
          value="12.4"
          unit="kWh"
          change="+8.2%"
          trending="up"
          icon={Zap}
        />
        <AnalyticCard
          title="Weekly Average"
          value="19.5"
          unit="kWh/day"
          change="+3.5%"
          trending="up"
          icon={Calendar}
        />
        <AnalyticCard
          title="Avg Voltage"
          value={avgVoltage}
          unit="V"
          change="-1.2%"
          trending="down"
          icon={TrendingUp}
        />
        <AnalyticCard
          title="Avg Efficiency"
          value={avgEfficiency}
          unit="%"
          change="+5.8%"
          trending="up"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Energy Generation Today</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="hour"
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
              <Bar dataKey="energy" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Weekly Energy Generation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="day"
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
              <Bar dataKey="energy" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {performanceData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-300">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Key Insights</h3>
          <div className="space-y-4">
            <InsightCard
              title="Peak Performance Period"
              value="12:00 PM - 3:00 PM"
              description="Maximum energy generation during midday hours"
              color="emerald"
            />
            <InsightCard
              title="Optimal Wind Conditions"
              value="4.5 - 7.2 m/s"
              description="Best efficiency achieved in this range"
              color="cyan"
            />
            <InsightCard
              title="Next Maintenance"
              value="In 15 days"
              description="Scheduled bearing inspection due"
              color="yellow"
            />
            <InsightCard
              title="Monthly Projection"
              value="586 kWh"
              description="Based on current performance trends"
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticCard({
  title,
  value,
  unit,
  change,
  trending,
  icon: Icon,
}: {
  title: string;
  value: string;
  unit: string;
  change: string;
  trending: 'up' | 'down';
  icon: any;
}) {
  const isPositive = trending === 'up';
  return (
    <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <Icon className="size-8 text-cyan-400" />
        <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {change}
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

function InsightCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600">
      <div className="flex items-start gap-3">
        <div className={`size-2 rounded-full bg-${color}-400 mt-2`} />
        <div className="flex-1">
          <h4 className="font-medium mb-1">{title}</h4>
          <p className={`text-lg font-semibold text-${color}-400 mb-1`}>{value}</p>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
