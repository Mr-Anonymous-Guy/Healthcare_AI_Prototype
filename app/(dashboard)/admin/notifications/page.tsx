'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BellRing,
  ArrowLeft,
  Search,
  Loader2,
  Mail,
  CheckCircle2,
  Clock,
  User,
  Bell,
} from 'lucide-react';

interface NotificationLogItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  scheduledFor?: string | null;
  sentAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: { fullName?: string } | null;
  };
}

export default function AdminNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [readFilter, setReadFilter] = useState<string>('ALL');

  const { data, isLoading } = useQuery<{ notifications: NotificationLogItem[] }>({
    queryKey: ['admin-notifications', readFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (readFilter === 'READ') params.append('isRead', 'true');
      if (readFilter === 'UNREAD') params.append('isRead', 'false');
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch notifications log');
      return res.json();
    },
  });

  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-blue-600" /> Notifications & Reminder Dispatch Log
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Telemetry for in-app reminder alerts and Resend email dispatches across all users.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Read Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
            {['ALL', 'READ', 'UNREAD'].map((rf) => (
              <button
                key={rf}
                onClick={() => setReadFilter(rf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  readFilter === rf
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title, user email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <span>Fetching notification logs...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">
            No notification events match filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Notification Title</th>
                  <th className="py-3.5 px-4">Recipient Patient</th>
                  <th className="py-3.5 px-4">Category Type</th>
                  <th className="py-3.5 px-4">Read Status</th>
                  <th className="py-3.5 px-4">Dispatched Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{notif.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-md line-clamp-1">{notif.message}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${notif.user.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline block text-xs"
                        >
                          {notif.user.profile?.fullName || 'Anonymous Patient'}
                        </Link>
                        <span className="text-[11px] text-slate-400">{notif.user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        {notif.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          notif.isRead
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {notif.isRead ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Read
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Unread
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
