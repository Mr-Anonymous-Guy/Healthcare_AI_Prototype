'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Phone,
  Droplet,
  FileText,
  Activity,
  CalendarDays,
  Bot,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';

interface UserDetailData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    emergencyContact?: string;
    medicalHistory?: string;
    allergies?: string;
  } | null;
  files: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }>;
  appointments: Array<{
    id: string;
    doctorName: string;
    appointmentDate: string;
    status: string;
    department?: string;
  }>;
  vitals: Array<{
    id: string;
    heartRate?: number | null;
    spO2?: number | null;
    temperature?: number | null;
    bloodPressureSystolic?: number | null;
    bloodPressureDiastolic?: number | null;
    glucose?: number | null;
    recordedAt: string;
  }>;
  symptoms: Array<{
    id: string;
    symptomName: string;
    severity: number;
    duration: string;
    loggedAt: string;
  }>;
  conversations: Array<{
    id: string;
    title: string;
    createdAt: string;
    _count: { messages: number };
  }>;
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery<{ user: UserDetailData }>({
    queryKey: ['admin-user-detail', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user details');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading user activity profile...</p>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">User Profile Not Found</h2>
        <p className="text-sm text-slate-500">The requested user ID does not exist in the database.</p>
        <Link
          href="/admin/users"
          className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          Return to User Directory
        </Link>
      </div>
    );
  }

  const user = data.user;
  const profile = user.profile;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to User Directory
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 font-extrabold text-xl flex items-center justify-center">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {profile?.fullName || 'Anonymous Profile'}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  {user.role}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email} • ID: {user.id}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Account Created:
          </div>
          <div className="font-mono text-slate-700">{new Date(user.createdAt).toLocaleString()}</div>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Metadata Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" /> Profile Information
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Full Name:</span>
              <span className="text-slate-800 font-bold">{profile?.fullName || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Phone Contact:</span>
              <span className="text-slate-800 font-medium flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" /> {profile?.phone || 'None registered'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Blood Type:</span>
              <span className="text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                <Droplet className="w-3 h-3 text-rose-500 fill-rose-500" /> {profile?.bloodType || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Emergency Contact:</span>
              <span className="text-slate-800 font-medium">{profile?.emergencyContact || 'None registered'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Medical Background:</span>
              <span className="text-slate-700 block mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px] leading-relaxed">
                {profile?.medicalHistory || 'No prior conditions listed'}
              </span>
            </div>
          </div>
        </div>

        {/* User Activity & Modules Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Uploaded Files */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Medical Reports ({user.files.length})
              </h2>
              <Link href="/admin/files" className="text-xs text-blue-600 font-bold hover:underline">
                View All Files ➔
              </Link>
            </div>

            {user.files.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center italic">No medical records uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {user.files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{file.fileName}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-slate-400 font-medium">
                      <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments & Vitals Dual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointments */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <CalendarDays className="w-4 h-4 text-purple-600" /> Appointments ({user.appointments.length})
              </h2>
              {user.appointments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">No scheduled appointments.</p>
              ) : (
                <div className="space-y-2">
                  {user.appointments.map((app) => (
                    <div key={app.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{app.doctorName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'UPCOMING'
                              ? 'bg-purple-100 text-purple-700'
                              : app.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {new Date(app.appointmentDate).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vitals Logs */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-4 h-4 text-blue-600" /> Recent Vitals ({user.vitals.length})
              </h2>
              {user.vitals.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center italic">No vitals logged.</p>
              ) : (
                <div className="space-y-2">
                  {user.vitals.slice(0, 4).map((v) => (
                    <div key={v.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        {v.heartRate && <span>HR: {v.heartRate} bpm</span>}
                        {v.spO2 && <span>SpO2: {v.spO2}%</span>}
                        {v.temperature && <span>Temp: {v.temperature}°C</span>}
                        {v.bloodPressureSystolic && <span>BP: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic || ''}</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(v.recordedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
