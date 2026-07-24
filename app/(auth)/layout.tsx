import Link from 'next/link';
import { Stethoscope, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Mesh Gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/15 via-indigo-300/15 to-emerald-300/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Brand Header Badge */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-bold text-xl text-slate-900 tracking-tight block">
              HealthAI
            </span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest block -mt-1">
              SIH Assistant
            </span>
          </div>
        </Link>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Non-Diagnostic Health Intelligence</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer Back to Home link */}
      <div className="mt-8 text-center text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          ← Back to Public Homepage
        </Link>
      </div>
    </div>
  );
}
