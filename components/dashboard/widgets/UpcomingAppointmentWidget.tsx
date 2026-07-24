'use client';

import { Calendar, Clock, UserCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Appointment } from '@/types/database';

export default function UpcomingAppointmentWidget() {
  const { data, isLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: ['upcoming-appointment-widget'],
    queryFn: async () => {
      const res = await fetch('/api/appointments?status=SCHEDULED&limit=1');
      if (!res.ok) throw new Error('Failed to fetch appointment');
      return res.json();
    },
  });

  const nextAppointment = data?.appointments?.[0];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</h3>
        <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Calendar className="w-5 h-5" />
        </span>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400">Loading appointment...</div>
      ) : !nextAppointment ? (
        <div className="py-4 text-center text-xs text-gray-400 space-y-2">
          <p>No upcoming appointments scheduled.</p>
          <Link
            href="/appointments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <Plus size={12} /> Schedule now
          </Link>
        </div>
      ) : (
        <>
          <div>
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              {nextAppointment.doctorName}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{nextAppointment.department || 'General Practice'}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>
                {new Date(nextAppointment.appointmentDate).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
              Scheduled
            </span>
          </div>

          <div className="mt-4">
            <Link
              href="/appointments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              Manage appointments →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
