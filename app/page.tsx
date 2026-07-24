'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
  Stethoscope,
  MessageCircle,
  Activity,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileText,
  HeartPulse,
  Lock,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import DemoVideoPlaceholder from '@/components/landing/DemoVideoPlaceholder';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ─── PUBLIC NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block">
                HealthAI
              </span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest block -mt-1">
                SIH Prototype
              </span>
            </div>
          </Link>

          {/* Center SIH Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Built for Smart India Hackathon</span>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Background Mesh Gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-emerald-300/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
        >
          {/* Trust Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center">
            <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Predictive & Preventive Health Assistant
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]"
          >
            Your Personal Medical Record{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </motion.h1>

          {/* Value Prop Subhead */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed"
          >
            Empowering patients and providers with non-diagnostic AI intelligence — extract lab findings, track vitals trends, and query your medical documents in seconds.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            variants={itemVariants}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-blue-600 text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              Get Started Free{' '}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-center"
            >
              Log In to Portal
            </Link>
          </motion.div>

          {/* Key Guarantees */}
          <motion.div
            variants={itemVariants}
            className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Private & Secure Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" /> RAG-Powered AI Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Non-Diagnostic Educational Tool
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── PRODUCT DEMO SECTION ────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Live Interactive Prototype
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              See HealthAI Assistant in Action
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              Watch how HealthAI parses medical PDFs, generates vector embeddings, and answers complex record queries in real time.
            </p>
          </div>

          {/* Demo Video Container */}
          <DemoVideoPlaceholder videoSrc="/Videos/Healthcare_AI_Prototype.mp4" />
        </div>
      </section>

      {/* ─── FEATURE HIGHLIGHTS GRID ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for Comprehensive Health Intelligence
            </h2>
            <p className="text-sm md:text-base text-slate-600">
              A unified platform combining RAG document intelligence, vitals monitoring, symptom tracking, and appointment workflows.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Medical Report AI Chat (RAG)
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Query uploaded lab reports and doctor summaries with OpenAI `text-embedding-3-small` and `pgvector` vector similarity search.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Symptom Tracking & Logs
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Log daily health symptoms with Zod validation, severity ratings (1–10), duration notes, and real-time history tracking.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Unified Health Timeline
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Chronological feed consolidating medical reports, recorded vitals, symptom logs, and provider appointments in one view.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Smart Vitals Analytics
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Monitor heart rate, blood pressure, glucose, temperature, and SpO2 levels with interactive Recharts data visualization.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Appointments & Notifications
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Schedule doctor visits, manage cancellations, receive automated Resend email confirmations, and track in-app reminder badges.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Admin Audit & RBAC Controls
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Database-gated role-based access control (PATIENT / ADMIN), system analytics, and detailed event audit log tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP & MEDICAL DISCLAIMER ─────────────────────────────── */}
      <section className="py-10 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Smart India Hackathon (SIH) Prototype
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Team AI Healthcare • SIH Healthcare Track
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1 text-slate-300 text-xs md:text-sm leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Medical & Safety Notice:</strong> HealthAI Assistant is an informational and document organization tool designed to assist patients in tracking health data. It does <strong>not</strong> generate clinical diagnoses or prescribe treatments. Always consult a licensed medical professional for healthcare decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER & REPEAT CTA ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 py-12 md:py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Repeat CTA Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Ready to Organize Your Health Intelligence?
              </h3>
              <p className="text-blue-100 text-sm md:text-base max-w-xl">
                Get started today by uploading your medical reports and logging your health vitals.
              </p>
            </div>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 hover:scale-105 transition-all shadow-lg shrink-0"
            >
              Get Started Now
            </Link>
          </div>

          {/* Links and Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-900 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-200 text-sm">HealthAI Prototype</span>
            </div>

            <div className="flex items-center gap-6 font-medium text-slate-400">
              <Link href="/login" className="hover:text-white transition-colors">
                Log In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Register
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>

            <div className="text-slate-500">
              © {new Date().getFullYear()} HealthAI Prototype. Built for SIH.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
