import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { downloadExport } from '../lib/api';

export function ExportCenter() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Center</h1>
        <p className="text-slate-400 mt-1">Download telemetry and reporting outputs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExportTile title="CSV" description="Raw telemetry for Excel or lab analysis." onClick={() => downloadExport('csv')} icon={FileSpreadsheet} />
        <ExportTile title="Excel" description="Formatted workbook with telemetry history." onClick={() => downloadExport('excel')} icon={FileText} />
        <ExportTile title="PDF" description="Printable report for viva or stakeholder review." onClick={() => downloadExport('pdf')} icon={Printer} />
      </div>

      <div className="p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Download className="size-5 text-cyan-400" />
          One-click report actions
        </h3>
        <p className="text-slate-400 text-sm max-w-2xl">
          Export from the live backend endpoint, print charts from the browser, or schedule report generation later with the same data source.
        </p>
      </div>
    </div>
  );
}

function ExportTile({ title, description, onClick, icon: Icon }: { title: string; description: string; onClick: () => Promise<void>; icon: any }) {
  return (
    <button onClick={onClick} className="group text-left p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/40 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <Icon className="size-8 text-cyan-400" />
        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Export</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-cyan-300 text-sm font-medium group-hover:translate-x-1 transition-transform">
        Download file <Download className="size-4" />
      </div>
    </button>
  );
}
