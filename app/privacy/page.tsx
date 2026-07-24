import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                HealthAI Data Privacy Policy
              </h1>
              <p className="text-xs text-slate-500 font-medium">Last updated: July 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4 text-slate-600">
            <p>
              HealthAI Assistant is built for the Smart India Hackathon (SIH) prototype demonstration with a strict commitment to medical data privacy and security.
            </p>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
              <Lock className="w-4 h-4 text-blue-600" /> 1. Data Encryption & Storage Security
            </h3>
            <p>
              All medical documents, extracted vector embeddings, vitals logs, and appointment records are stored in encrypted Postgres databases powered by Supabase with Row-Level Security (RLS) policies.
            </p>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
              <FileText className="w-4 h-4 text-emerald-600" /> 2. RAG Document AI Processing
            </h3>
            <p>
              Uploaded PDFs are processed client-side via PDF.js and sent to OpenAI API endpoints for generating embeddings using `text-embedding-3-small`. Data is utilized solely for your active health queries.
            </p>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" /> 3. Non-Diagnostic Disclaimer
            </h3>
            <p>
              HealthAI Assistant is an informational health record assistant, not a diagnostic medical device. Users maintain complete ownership of their data and can request deletion at any time.
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
