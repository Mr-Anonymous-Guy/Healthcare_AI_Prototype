'use client';

import { AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Symptom } from '@/types/database';

export default function SymptomsWidget() {
  const { data, isLoading } = useQuery<{ symptoms: Symptom[] }>({
    queryKey: ['symptoms-widget'],
    queryFn: async () => {
      const res = await fetch('/api/symptoms?limit=3');
      if (!res.ok) throw new Error('Failed to fetch symptoms');
      return res.json();
    },
  });

  const symptoms = data?.symptoms || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Symptoms</h3>
        <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
          <AlertCircle className="w-5 h-5" />
        </span>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400">Loading symptoms...</div>
      ) : symptoms.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">
          No symptoms logged recently.
        </div>
      ) : (
        <div className="space-y-3">
          {symptoms.map((symptom) => (
            <div
              key={symptom.id}
              className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl"
            >
              <div>
                <p className="text-xs font-bold text-gray-900">{symptom.symptomName}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {symptom.duration ? `Duration: ${symptom.duration}` : 'Logged recently'}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                  Severity {symptom.severity}/10
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(symptom.loggedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <Link
          href="/vitals"
          className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
        >
          Track symptoms & vitals →
        </Link>
        <Link
          href="/vitals"
          className="text-[11px] font-medium text-purple-600 hover:underline flex items-center gap-0.5"
        >
          <Plus size={12} /> Log
        </Link>
      </div>
    </div>
  );
}
