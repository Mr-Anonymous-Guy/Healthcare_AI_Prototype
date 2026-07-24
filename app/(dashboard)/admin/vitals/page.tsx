'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ActivitySquare,
  ArrowLeft,
  Search,
  Loader2,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface VitalItem {
  id: string;
  heartRate?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: number | null;
  glucose?: number | null;
  spO2?: number | null;
  recordedAt: string;
  isAnomalous: boolean;
  anomalyReason?: string;
  user: {
    id: string;
    email: string;
    profile?: { fullName?: string } | null;
  };
}

interface SymptomItem {
  id: string;
  symptomName: string;
  severity: number;
  duration: string;
  loggedAt: string;
  notes?: string | null;
  user: {
    id: string;
    email: string;
    profile?: { fullName?: string } | null;
  };
}

export default function AdminVitalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'vitals' | 'symptoms'>('vitals');

  const { data, isLoading } = useQuery<{ vitals: VitalItem[]; symptoms: SymptomItem[] }>({
    queryKey: ['admin-vitals-symptoms', searchTerm],
    queryFn: async () => {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await fetch(`/api/admin/vitals${query}`);
      if (!res.ok) throw new Error('Failed to fetch vitals and symptoms');
      return res.json();
    },
  });

  const vitals = data?.vitals || [];
  const symptoms = data?.symptoms || [];

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
            <ActivitySquare className="w-6 h-6 text-blue-600" /> Patient Vitals & Symptoms Monitor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Aggregate log volume across patients with highlighted clinical anomaly threshold alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vitals' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Vitals Logs ({vitals.length})
            </button>
            <button
              onClick={() => setActiveTab('symptoms')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'symptoms' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Symptom Logs ({symptoms.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user name/email..."
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
            <span>Fetching vitals & symptoms telemetry...</span>
          </div>
        ) : activeTab === 'vitals' ? (
          vitals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              No patient vitals logged matching query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Recorded Vitals</th>
                    <th className="py-3.5 px-4">Patient Owner</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Clinical Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitals.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          {v.heartRate && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                              HR: {v.heartRate} bpm
                            </span>
                          )}
                          {v.bloodPressureSystolic && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                              BP: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic || ''} mmHg
                            </span>
                          )}
                          {v.spO2 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                              SpO2: {v.spO2}%
                            </span>
                          )}
                          {v.temperature && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                              Temp: {v.temperature}°C
                            </span>
                          )}
                          {v.glucose && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                              Glucose: {v.glucose} mg/dL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <Link
                            href={`/admin/users/${v.user.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 hover:underline block text-xs"
                          >
                            {v.user.profile?.fullName || 'Anonymous Patient'}
                          </Link>
                          <span className="text-[11px] text-slate-400">{v.user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(v.recordedAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {v.isAnomalous ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {v.anomalyReason}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Normal Range
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : symptoms.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">
            No patient symptoms reported matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Symptom Description</th>
                  <th className="py-3.5 px-4">Severity (1-10)</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Patient Owner</th>
                  <th className="py-3.5 px-4">Onset Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {symptoms.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{s.symptomName}</div>
                      {s.notes && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.notes}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          s.severity >= 8
                            ? 'bg-rose-100 text-rose-700'
                            : s.severity >= 5
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {s.severity} / 10
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 font-medium">{s.duration}</td>
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${s.user.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline block text-xs"
                        >
                          {s.user.profile?.fullName || 'Anonymous Patient'}
                        </Link>
                        <span className="text-[11px] text-slate-400">{s.user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(s.loggedAt).toLocaleDateString()}
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
