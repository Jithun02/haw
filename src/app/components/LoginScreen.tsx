import { useState } from 'react';
import { ArrowRight, Shield, Wind } from 'lucide-react';

type LoginScreenProps = {
  loading: boolean;
  error: string | null;
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
};

export function LoginScreen({ loading, error, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('admin@windmill.local');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="min-h-full relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,#020617_0%,#050816_50%,#020617_100%)] text-white flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="relative w-full max-w-6xl grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 backdrop-blur-sm">
            <Wind className="size-4" />
            Smart Windmill Energy Platform
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Enterprise wind analytics with live hardware control.
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-xl">
              Secure operator access, real-time telemetry, predictive maintenance, and one-click export for your Arduino windmill prototype.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
            <FeatureCard title="Live Telemetry" text="USB serial ingestion with auto reconnect and demo fallback." />
            <FeatureCard title="AI Insights" text="Fault detection, output predictions, and maintenance guidance." />
            <FeatureCard title="Premium UX" text="Dark glassmorphism dashboard designed for demo and field use." />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-cyan-500/10 blur-3xl" />
          <form
            onSubmit={async event => {
              event.preventDefault();
              await onLogin(email, password, rememberMe);
            }}
            className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-cyan-950/30 p-8 md:p-10 space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-cyan-300">
                <Shield className="size-5" />
                Secure Login
              </div>
              <h2 className="text-3xl font-semibold">Access the control room</h2>
              <p className="text-slate-400">Use the seeded admin account or connect your own identity provider later.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Email</span>
              <input
                value={email}
                onChange={event => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="admin@windmill.local"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
              <input
                value={password}
                onChange={event => setPassword(event.target.value)}
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                placeholder="••••••••"
              />
            </label>

            <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={event => setRememberMe(event.target.checked)}
                  className="size-4 rounded border-slate-600 bg-transparent text-cyan-400 focus:ring-cyan-400"
                />
                Remember me
              </label>
              <span className="text-cyan-300">Admin / User roles supported</span>
            </div>

            {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3.5 font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Enter Dashboard'}
              <ArrowRight className="size-4" />
            </button>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-cyan-300">Admin</div>
                <div>admin@windmill.local / admin123</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-cyan-300">User</div>
                <div>user@windmill.local / user123</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
