import { Wind, LayoutDashboard, LineChart, BarChart3, Bell, Sliders, Terminal, Zap, Battery, Eye, Settings as SettingsIcon, ShieldCheck, Download, LogOut } from 'lucide-react';
import type { UserInfo } from '../lib/api';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isConnected: boolean;
  user: UserInfo;
  onLogout: () => void;
};

export function Sidebar({ activeTab, setActiveTab, isConnected, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'visualizer', label: '3D Visualizer', icon: Eye },
    { id: 'charts', label: 'Live Charts', icon: LineChart },
    { id: 'voltage', label: 'Voltage Analysis', icon: Zap },
    { id: 'power', label: 'Power Analysis', icon: Battery },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'control', label: 'Control', icon: Sliders },
    { id: 'monitor', label: 'Serial Monitor', icon: Terminal },
    { id: 'maintenance', label: 'Maintenance', icon: ShieldCheck },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-72 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <Wind className="size-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">WindPower</h1>
            <p className="text-xs text-slate-400">Energy Monitor</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Signed in</div>
          <div className="font-semibold text-white">{user.full_name}</div>
          <div className="text-sm text-slate-400">{user.email}</div>
          <div className="mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 capitalize">{user.role}</div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="size-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800">
          <div className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="text-sm text-slate-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button onClick={onLogout} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
