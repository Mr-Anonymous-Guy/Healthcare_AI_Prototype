'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Activity, AlertCircle, Calendar, LineChart, RefreshCw } from 'lucide-react';
import VitalsChart from '@/components/vitals/VitalsChart';
import VitalsForm from '@/components/vitals/VitalsForm';
import SymptomForm from '@/components/symptoms/SymptomForm';
import SymptomList from '@/components/symptoms/SymptomList';
import TimelineFeed from '@/components/timeline/TimelineFeed';
import { Vital, Symptom } from '@/types/database';
import { TimelineItem } from '@/app/api/timeline/route';

export default function VitalsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'vitals' | 'symptoms' | 'timeline'>('vitals');
  const [chartMetric, setChartMetric] = useState<'all' | 'heartRate' | 'bloodPressure' | 'glucose' | 'spO2'>('all');
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);

  // Fetch Vitals
  const { data: vitalsData, isLoading: isLoadingVitals, refetch: refetchVitals } = useQuery<{ vitals: Vital[] }>({
    queryKey: ['vitals'],
    queryFn: async () => {
      const res = await fetch('/api/vitals');
      if (!res.ok) throw new Error('Failed to fetch vitals');
      return res.json();
    },
  });

  // Fetch Symptoms
  const { data: symptomsData, isLoading: isLoadingSymptoms, refetch: refetchSymptoms } = useQuery<{ symptoms: Symptom[] }>({
    queryKey: ['symptoms'],
    queryFn: async () => {
      const res = await fetch('/api/symptoms');
      if (!res.ok) throw new Error('Failed to fetch symptoms');
      return res.json();
    },
  });

  // Fetch Timeline
  const { data: timelineData, isLoading: isLoadingTimeline, refetch: refetchTimeline } = useQuery<{ timeline: TimelineItem[] }>({
    queryKey: ['timeline'],
    queryFn: async () => {
      const res = await fetch('/api/timeline');
      if (!res.ok) throw new Error('Failed to fetch timeline');
      return res.json();
    },
  });

  const vitals = vitalsData?.vitals || [];
  const symptoms = symptomsData?.symptoms || [];
  const timeline = timelineData?.timeline || [];

  function handleVitalSuccess() {
    setShowVitalModal(false);
    queryClient.invalidateQueries({ queryKey: ['vitals'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });
  }

  function handleSymptomSuccess() {
    setShowSymptomModal(false);
    queryClient.invalidateQueries({ queryKey: ['symptoms'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vitals, Symptoms & Health Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily health metrics, log symptoms, and view your chronological health history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVitalModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} />
            Log Vitals
          </button>
          <button
            onClick={() => setShowSymptomModal(true)}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} />
            Log Symptom
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        <button
          onClick={() => setActiveTab('vitals')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'vitals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity size={16} />
          Vitals & Trends
        </button>
        <button
          onClick={() => setActiveTab('symptoms')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'symptoms'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle size={16} />
          Symptom Tracker ({symptoms.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} />
          Health Timeline
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'vitals' && (
        <div className="space-y-6">
          {/* Chart Header & Controls */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LineChart className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900 text-base">Vitals Trends Chart</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Metric:</span>
                {(['all', 'heartRate', 'bloodPressure', 'glucose', 'spO2'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      chartMetric === m
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m === 'all'
                      ? 'All'
                      : m === 'heartRate'
                      ? 'Heart Rate'
                      : m === 'bloodPressure'
                      ? 'Blood Pressure'
                      : m === 'glucose'
                      ? 'Glucose'
                      : 'SpO2'}
                  </button>
                ))}
              </div>
            </div>

            <VitalsChart vitals={vitals} metric={chartMetric} />
          </div>

          {/* Recent Vitals List */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 text-base">Recent Vitals Records</h3>
            {isLoadingVitals ? (
              <div className="text-center py-6 text-gray-400 text-sm">Loading vitals...</div>
            ) : vitals.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No vitals recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Heart Rate</th>
                      <th className="px-4 py-2.5">Blood Pressure</th>
                      <th className="px-4 py-2.5">Glucose</th>
                      <th className="px-4 py-2.5">Temperature</th>
                      <th className="px-4 py-2.5">SpO2</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vitals.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs text-gray-700 font-medium whitespace-nowrap">
                          {new Date(v.recordedAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 font-semibold">
                          {v.heartRate ? `${v.heartRate} bpm` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 font-semibold">
                          {v.bloodPressureSystolic && v.bloodPressureDiastolic
                            ? `${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 font-semibold">
                          {v.glucose ? `${v.glucose} mg/dL` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 font-semibold">
                          {v.temperature ? `${v.temperature}°F` : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-900 font-semibold">
                          {v.spO2 ? `${v.spO2}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'symptoms' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-base">Symptom Log History</h3>
            <button
              onClick={() => refetchSymptoms()}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          {isLoadingSymptoms ? (
            <div className="text-center py-6 text-gray-400 text-sm">Loading symptoms...</div>
          ) : (
            <SymptomList symptoms={symptoms} onDeleteSuccess={() => refetchSymptoms()} />
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-base">Health Event Timeline</h3>
            <button
              onClick={() => refetchTimeline()}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <TimelineFeed timeline={timeline} isLoading={isLoadingTimeline} />
        </div>
      )}

      {/* Vitals Form Modal */}
      {showVitalModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Log New Vital Signs</h3>
            <VitalsForm onSuccess={handleVitalSuccess} onCancel={() => setShowVitalModal(false)} />
          </div>
        </div>
      )}

      {/* Symptoms Form Modal */}
      {showSymptomModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Log New Symptom</h3>
            <SymptomForm onSuccess={handleSymptomSuccess} onCancel={() => setShowSymptomModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
