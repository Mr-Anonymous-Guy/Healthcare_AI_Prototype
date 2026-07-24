import { Loader2 } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md bg-white/80 p-8 rounded-3xl shadow-xl border border-slate-100 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-xs font-semibold text-slate-600">Loading authentication form...</p>
    </div>
  );
}
