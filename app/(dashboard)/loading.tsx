import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-700">Loading module...</p>
        <p className="text-xs text-slate-400">Fetching your health records and session info</p>
      </div>
    </div>
  );
}
