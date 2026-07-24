'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Clock, Stethoscope, User, Edit, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { Appointment } from '@/types/database';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const { data, isLoading, refetch } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    },
  });

  const appointments = data?.appointments || [];
  const now = new Date();

  const filteredAppointments = appointments.filter((app) => {
    const appDate = new Date(app.appointmentDate);
    if (activeTab === 'upcoming') {
      return appDate >= now && app.status !== 'CANCELLED';
    }
    if (activeTab === 'past') {
      return appDate < now || app.status === 'COMPLETED' || app.status === 'CANCELLED';
    }
    return true;
  });

  async function handleCancel(id: string, doctorName: string) {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel appointment');
      toast.success(`Appointment with ${doctorName} cancelled`);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    } catch {
      toast.error('Failed to cancel appointment');
    }
  }

  function handleFormSuccess() {
    setShowModal(false);
    setEditingAppointment(null);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });
  }

  function getStatusBadge(status: Appointment['status']) {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            Cancelled
          </span>
        );
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Schedule doctor consultations, manage reminders, and track appointment history.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={16} />
          Book Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex items-center justify-between">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar size={16} />
            Upcoming ({appointments.filter((a) => new Date(a.appointmentDate) >= now && a.status !== 'CANCELLED').length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'past'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={16} />
            Past / Cancelled
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Appointments ({appointments.length})
          </button>
        </div>

        <button
          onClick={() => refetch()}
          className="text-xs text-gray-500 hover:text-gray-700 pb-3 flex items-center gap-1"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 space-y-2">
          <Calendar size={32} className="mx-auto opacity-30" />
          <p className="font-semibold text-gray-600">No appointments found</p>
          <p className="text-xs text-gray-400">Book your first doctor appointment to receive automated reminders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((app) => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{app.doctorName}</h3>
                      <p className="text-xs text-gray-500">{app.department || 'General Practice'}</p>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar size={14} className="text-blue-500 shrink-0" />
                    <span>
                      {new Date(app.appointmentDate).toLocaleString(undefined, {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  {app.notes && (
                    <div className="flex items-start gap-2 text-gray-500 pt-1 border-t border-gray-200/50 mt-1">
                      <span className="font-semibold shrink-0">Notes:</span>
                      <span className="truncate">{app.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {app.status === 'SCHEDULED' && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingAppointment(app);
                      setShowModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit size={13} /> Edit / Reschedule
                  </button>

                  <button
                    onClick={() => handleCancel(app.id, app.doctorName)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <XCircle size={13} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingAppointment ? 'Reschedule Appointment' : 'Book New Appointment'}
            </h3>
            <AppointmentForm
              initialData={editingAppointment}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
