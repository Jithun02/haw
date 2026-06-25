import { useState, useEffect } from 'react';
import { Wind, Play, Pause, RotateCw, Gauge } from 'lucide-react';
import type { SensorData } from '../App';

type WindmillVisualizerProps = {
  currentData: SensorData;
};

export function WindmillVisualizer({ currentData }: WindmillVisualizerProps) {
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [viewAngle, setViewAngle] = useState(0);

  useEffect(() => {
    if (!isPaused) {
      const rotationSpeed = (currentData.rpm / 60) * 6; 
      const interval = setInterval(() => {
        setRotation(prev => (prev + rotationSpeed) % 360);
      }, 16);

      return () => clearInterval(interval);
    }
  }, [currentData.rpm, isPaused]);

  const bladeCount = 3;
  const hubRadius = 20;
  const bladeLength = 120;
  const bladeWidth = 15;

  const WindParticle = ({ delay }: { delay: number }) => {
    const speed = currentData.windSpeed * 10;
    const yPos = 20 + Math.random() * 60;

    return (
      <div
        className="absolute w-2 h-0.5 bg-cyan-400/40 rounded-full"
        style={{
          top: `${yPos}%`,
          left: '0%',
          animation: `windFlow ${3 / currentData.windSpeed}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">3D Windmill Visualizer</h1>
          <p className="text-slate-400 mt-1">Interactive turbine animation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-3 rounded-lg transition-colors ${
              isPaused ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isPaused ? <Play className="size-5" /> : <Pause className="size-5" />}
          </button>
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-4 py-3 rounded-lg transition-colors ${
              showParticles ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Wind className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          label="Rotation Speed"
          value={`${currentData.rpm.toFixed(0)} RPM`}
          color="purple"
          icon={RotateCw}
        />
        <StatusCard
          label="Wind Speed"
          value={`${currentData.windSpeed.toFixed(1)} m/s`}
          color="cyan"
          icon={Wind}
        />
        <StatusCard
          label="Power Output"
          value={`${currentData.power.toFixed(2)} W`}
          color="emerald"
          icon={Gauge}
        />
        <StatusCard
          label="Blade Angle"
          value={`${rotation.toFixed(0)}°`}
          color="yellow"
          icon={RotateCw}
        />
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700 relative overflow-hidden">
        <style>{`
          @keyframes windFlow {
            0% { transform: translateX(0); opacity: 0; }
            10% { opacity: 0.4; }
            90% { opacity: 0.4; }
            100% { transform: translateX(800px); opacity: 0; }
          }
          @keyframes windPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}</style>

        {showParticles && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <WindParticle key={i} delay={i * 0.3} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-center min-h-[500px] relative">
          { }
          <div className="absolute bottom-0" style={{ transform: `perspective(1000px) rotateY(${viewAngle}deg)` }}>
            <div className="w-8 h-64 bg-gradient-to-b from-slate-600 to-slate-800 rounded-t-lg mx-auto relative">
              <div className="absolute inset-y-0 left-0 w-0.5 bg-slate-400/30" />
              <div className="absolute inset-y-0 right-0 w-0.5 bg-slate-900/50" />
            </div>
          </div>

          { }
          <div
            className="absolute"
            style={{
              bottom: '260px',
              transform: `perspective(1000px) rotateY(${viewAngle}deg)`,
            }}
          >
            <div className="w-24 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg shadow-2xl border border-slate-500/30" />
          </div>

          { }
          <div
            className="absolute"
            style={{
              bottom: '270px',
              transform: `perspective(1000px) rotateY(${viewAngle}deg)`,
            }}
          >
            <svg
              width="400"
              height="400"
              viewBox="-200 -200 400 400"
              className="drop-shadow-2xl"
            >
              { }
              <g transform={`rotate(${rotation})`}>
                {[...Array(bladeCount)].map((_, i) => {
                  const angle = (i * 360) / bladeCount;
                  return (
                    <g key={i} transform={`rotate(${angle})`}>
                      { }
                      <ellipse
                        cx={bladeLength / 2}
                        cy="0"
                        rx={bladeLength / 2}
                        ry={bladeWidth / 2}
                        fill="url(#bladeGradient)"
                        stroke="#475569"
                        strokeWidth="2"
                        opacity="0.95"
                      />
                      { }
                      <ellipse
                        cx={bladeLength / 2}
                        cy="-2"
                        rx={bladeLength / 2.5}
                        ry={bladeWidth / 4}
                        fill="white"
                        opacity="0.15"
                      />
                    </g>
                  );
                })}
              </g>

              { }
              <circle
                cx="0"
                cy="0"
                r={hubRadius}
                fill="url(#hubGradient)"
                stroke="#334155"
                strokeWidth="3"
              />
              <circle
                cx="0"
                cy="0"
                r={hubRadius - 5}
                fill="none"
                stroke="#64748b"
                strokeWidth="1"
                opacity="0.5"
              />
              <circle
                cx="-5"
                cy="-5"
                r={hubRadius / 3}
                fill="white"
                opacity="0.3"
              />

              <defs>
                <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <radialGradient id="hubGradient">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          { }
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setViewAngle(prev => prev - 15)}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
          >
            ← Rotate Left
          </button>
          <button
            onClick={() => setViewAngle(0)}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
          >
            Reset View
          </button>
          <button
            onClick={() => setViewAngle(prev => prev + 15)}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
          >
            Rotate Right →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Turbine Specifications</h3>
          <div className="space-y-3">
            <SpecRow label="Turbine Type" value="Horizontal Axis (HAWT)" />
            <SpecRow label="Blade Count" value="3 Blades" />
            <SpecRow label="Rotor Diameter" value="0.5 meters" />
            <SpecRow label="Swept Area" value="0.196 m²" />
            <SpecRow label="Cut-in Wind Speed" value="2.0 m/s" />
            <SpecRow label="Rated Wind Speed" value="8.0 m/s" />
            <SpecRow label="Max RPM" value="500 RPM" />
            <SpecRow label="Generator Type" value="DC Motor" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
          <h3 className="font-semibold text-lg mb-4">Real-Time Performance</h3>
          <div className="space-y-4">
            <PerformanceBar
              label="Wind Availability"
              value={(currentData.windSpeed / 10) * 100}
              color="cyan"
            />
            <PerformanceBar
              label="Rotation Speed"
              value={(currentData.rpm / 500) * 100}
              color="purple"
            />
            <PerformanceBar
              label="Power Output"
              value={(currentData.power / 3) * 100}
              color="emerald"
            />
            <PerformanceBar
              label="Efficiency"
              value={currentData.efficiency}
              color="yellow"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-cyan-500/10 backdrop-blur-sm border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Wind className="size-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-cyan-400 mb-2">Aerodynamic Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
              <div>
                • Tip Speed Ratio: <strong className="text-cyan-400">
                  {(currentData.rpm * 0.25 * Math.PI / (currentData.windSpeed * 60)).toFixed(2)}</strong>
              </div>
              <div>
                • Blade Tip Speed: <strong className="text-emerald-400">
                  {(currentData.rpm * 0.25 * Math.PI / 60).toFixed(2)} m/s</strong>
              </div>
              <div>
                • Air Density: <strong className="text-purple-400">1.225 kg/m³</strong> (Standard)
              </div>
              <div>
                • Reynolds Number: <strong className="text-yellow-400">~15,000</strong> (Laminar)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: any;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`size-5 text-${color}-400`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-xl font-bold text-${color}-400`}>{value}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function PerformanceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-sm font-semibold text-${color}-400`}>{value.toFixed(0)}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-400 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
