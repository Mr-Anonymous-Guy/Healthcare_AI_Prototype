'use client';

import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Vital, Symptom } from '@/types/database';

export default function HealthScoreWidget() {
  const { data: vitalsData } = useQuery<{ vitals: Vital[] }>({
    queryKey: ['vitals-score'],
    queryFn: async () => {
      const res = await fetch('/api/vitals?limit=5');
      if (!res.ok) return { vitals: [] };
      return res.json();
    },
  });

  const { data: symptomsData } = useQuery<{ symptoms: Symptom[] }>({
    queryKey: ['symptoms-score'],
    queryFn: async () => {
      const res = await fetch('/api/symptoms?limit=5');
      if (!res.ok) return { symptoms: [] };
      return res.json();
    },
  });

  const vitals = vitalsData?.vitals || [];
  const symptoms = symptomsData?.symptoms || [];

  // Calculate dynamic health score
  let baseScore = 90;

  // Deduct score for high severity symptoms
  const severeSymptoms = symptoms.filter((s) => s.severity >= 6);
  baseScore -= severeSymptoms.length * 8;

  // Deduct score for abnormal recent vitals
  const latestVital = vitals[0];
  if (latestVital) {
    if (latestVital.heartRate && (latestVital.heartRate > 100 || latestVital.heartRate < 50)) baseScore -= 5;
    if (latestVital.bloodPressureSystolic && latestVital.bloodPressureSystolic > 130) baseScore -= 5;
    if (latestVital.glucose && latestVital.glucose > 140) baseScore -= 5;
    if (latestVital.spO2 && latestVital.spO2 < 95) baseScore -= 10;
  }

  const score = Math.max(50, Math.min(100, baseScore));
  const status = score >= 85 ? 'Optimal' : score >= 70 ? 'Good' : 'Needs Attention';
  const statusColor = score >= 85 ? 'text-emerald-600 bg-emerald-50' : score >= 70 ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Health Index</h3>
        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <Activity className="w-5 h-5" />
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-extrabold text-gray-900">{score}</span>
        <span className="text-sm font-semibold text-gray-400">/ 100</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>
          {score >= 70 ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {status}
        </span>
        <span className="text-gray-400">Calculated from logs</span>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
