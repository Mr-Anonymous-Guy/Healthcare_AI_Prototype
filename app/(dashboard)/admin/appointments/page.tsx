'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  CalendarDays,
  ArrowLeft,
  Search,
  Loader2,
  Calendar,
  User,
  MapPin,
  Clock,
  Ban,
  Filter,
} from 'lucide-react';

interface AppointmentItem {
  id: string;
  doctorName: string;
  appointmentDate: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  department?: string | null;
  notes?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      fullName?: string;
      phone?: string;
    } | null;
  };
}

export default function AdminAppointmentsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery<{ appointments: AppointmentItem[] }>({
    queryKey: ['admin-appointments', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to cancel appointment');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Appointment cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel appointment');
    },
  });

  const appointments = data?.appointments || [];

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
            <CalendarDays className="w-6 h-6 text-purple-600" /> System Appointments Monitor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Overview of patient doctor visits, scheduled appointments, and cancellation requests.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
            {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search doctor, patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
            <span>Fetching system appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">
            No system appointments match selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Doctor / Specialty</th>
                  <th className="py-3.5 px-4">Patient Info</th>
                  <th className="py-3.5 px-4">Schedule Date & Time</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{app.doctorName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${app.user.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline block text-xs"
                        >
                          {app.user.profile?.fullName || 'Anonymous Patient'}
                        </Link>
                        <span className="text-[11px] text-slate-400">{app.user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-700 font-semibold whitespace-nowrap">
                      {new Date(app.appointmentDate).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {app.department || 'General Medicine'}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          app.status === 'UPCOMING'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : app.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {app.status === 'UPCOMING' ? (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel appointment with ${app.doctorName} for ${app.user.email}? Action will emit an audit log.`)) {
                              cancelMutation.mutate(app.id);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" /> Cancel Visit
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">None available</span>
                      )}
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
