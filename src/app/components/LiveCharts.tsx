import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SensorData } from '../App';

type LiveChartsProps = {
  sensorData: SensorData[];
};

export function LiveCharts({ sensorData }: LiveChartsProps) {
  const chartData = sensorData.slice(-60).map(d => ({
    time: d.timestamp.toLocaleTimeString(),
    voltage: d.voltage,
    current: d.current,
    power: d.power,
    rpm: d.rpm,
    windSpeed: d.windSpeed,
    temperature: d.temperature,
    efficiency: d.efficiency,
  }));

  const chartConfig = [
    {
      title: 'Voltage vs Time',
      dataKey: 'voltage',
      color: '#facc15',
      unit: 'V',
    },
    {
      title: 'Current vs Time',
      dataKey: 'current',
      color: '#3b82f6',
      unit: 'A',
    },
    {
      title: 'Power Output vs Time',
      dataKey: 'power',
      color: '#10b981',
      unit: 'W',
    },
    {
      title: 'RPM vs Time',
      dataKey: 'rpm',
      color: '#a855f7',
      unit: 'RPM',
    },
    {
      title: 'Wind Speed vs Time',
      dataKey: 'windSpeed',
      color: '#06b6d4',
      unit: 'm/s',
    },
    {
      title: 'Efficiency vs Time',
      dataKey: 'efficiency',
      color: '#22c55e',
      unit: '%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Performance Charts</h1>
        <p className="text-slate-400 mt-1">Real-time sensor data visualization (Last 60 seconds)</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartConfig.map((config, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{config.title}</h3>
              <div className="px-3 py-1 rounded-lg bg-slate-700/50 text-sm text-slate-300">
                {config.unit}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  labelStyle={{ color: '#cbd5e1' }}
                  itemStyle={{ color: config.color }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey={config.dataKey}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
