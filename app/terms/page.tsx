import Link from 'next/link';
import { FileText, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Terms of Service
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Terms of Service & Usage Agreement
              </h1>
              <p className="text-xs text-slate-500 font-medium">Last updated: July 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4 text-slate-600">
            <p>
              Welcome to HealthAI Assistant. By accessing or using this application prototype, you agree to the following terms and conditions.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Important Medical Notice:</strong> HealthAI Assistant is an AI-powered health log and document organization prototype created for the Smart India Hackathon. It does NOT provide medical advice, diagnosis, or treatment plans.
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 1. User Responsibilities
            </h3>
            <p>
              Users are responsible for maintaining account confidentiality and ensuring that uploaded documents and health logs are accurate.
            </p>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 2. Prototype License
            </h3>
            <p>
              This application is provided &quot;as is&quot; for hackathon demonstration, educational, and preview purposes under the SIH 2026 framework.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">© 2026 HealthAI Prototype</span>
            <Link
              href="/register"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
