import { getAdminOverviewStats } from '@/services/adminService';
import Link from 'next/link';
import {
  Users,
  FolderOpen,
  CalendarDays,
  Bot,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  ShieldAlert,
  BellRing,
  ActivitySquare,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  const cards = [
    {
      title: 'Total System Users',
      value: stats.totalUsers,
      label: 'Registered Patient & Admin Accounts',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      href: '/admin/users',
    },
    {
      title: 'Medical Files Processed',
      value: stats.totalFiles,
      label: 'PDF Records Uploaded & Embedded',
      icon: FolderOpen,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      href: '/admin/files',
    },
    {
      title: 'Appointments This Week',
      value: stats.appointmentsThisWeek,
      label: 'Scheduled Doctor Visits in Current Week',
      icon: CalendarDays,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      href: '/admin/appointments',
    },
    {
      title: 'AI RAG Conversations',
      value: stats.totalConversations,
      label: 'Active AI Assistant Chat Threads',
      icon: Bot,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      href: '/admin/ai-sessions',
    },
    {
      title: 'Vitals & Symptoms Logged',
      value: stats.totalVitalsLogged + stats.totalSymptomsLogged,
      label: `${stats.totalVitalsLogged} Vitals + ${stats.totalSymptomsLogged} Symptoms`,
      icon: Activity,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      href: '/admin/vitals',
    },
    {
      title: 'Security Audit Logs',
      value: stats.totalAuditLogs,
      label: 'Recorded System & Admin Events',
      icon: ShieldCheck,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      href: '/admin/audit-logs',
    },
  ];

  const quickNav = [
    { name: 'User Management', desc: 'Manage user roles & patient detail histories', href: '/admin/users', icon: Users, badge: `${stats.totalUsers} Users` },
    { name: 'Medical Reports', desc: 'Inspect uploaded PDFs & text parsing status', href: '/admin/files', icon: FolderOpen, badge: `${stats.totalFiles} Files` },
    { name: 'Appointments', desc: 'View system-wide schedules & cancel appointments', href: '/admin/appointments', icon: CalendarDays, badge: `${stats.appointmentsThisWeek} This Week` },
    { name: 'Health Vitals & Symptoms', desc: 'Aggregate health trends & clinical anomaly flags', href: '/admin/vitals', icon: ActivitySquare, badge: `${stats.totalVitalsLogged} Vitals` },
    { name: 'AI Chat Sessions', desc: 'RAG conversation logs & QA transcript viewer', href: '/admin/ai-sessions', icon: Bot, badge: `${stats.totalConversations} Threads` },
    { name: 'System Notifications', desc: 'In-app reminder log & Resend email dispatches', href: '/admin/notifications', icon: BellRing, badge: 'Active' },
    { name: 'Security Audit Trail', desc: 'RBAC event logs & administrative action history', href: '/admin/audit-logs', icon: ShieldCheck, badge: `${stats.totalAuditLogs} Events` },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Operations & System Control
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin System Overview</h1>
          <p className="text-sm text-slate-300">
            Real-time telemetry, database metrics, and module monitors across HealthAI Assistant
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry Active
          </span>
        </div>
      </div>

      {/* Real-time Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-3xl bg-white border ${card.borderColor} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.color} flex items-center justify-center font-bold`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{card.value}</h3>
              <p className="text-sm font-bold text-slate-700 mb-0.5">{card.title}</p>
              <p className="text-xs text-slate-400 font-medium">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Navigation Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admin Monitoring Modules</h2>
          <span className="text-xs text-slate-500 font-medium">8 Full Monitoring Consoles Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {item.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
