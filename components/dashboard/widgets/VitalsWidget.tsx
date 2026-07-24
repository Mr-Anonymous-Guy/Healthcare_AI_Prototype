'use client';

import { Heart, Activity, Thermometer, Droplet, Plus } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Vital } from '@/types/database';

export default function VitalsWidget() {
  const { data, isLoading } = useQuery<{ vitals: Vital[] }>({
    queryKey: ['vitals-latest'],
    queryFn: async () => {
      const res = await fetch('/api/vitals?limit=1');
      if (!res.ok) throw new Error('Failed to fetch vitals');
      return res.json();
    },
  });

  const latestVital = data?.vitals?.[0];

  const vitalsDisplay = [
    {
      name: 'Heart Rate',
      value: latestVital?.heartRate ? `${latestVital.heartRate} bpm` : 'Not logged',
      status: latestVital?.heartRate ? (latestVital.heartRate <= 100 ? 'Normal' : 'Elevated') : '--',
      icon: Heart,
      color: 'text-rose-500 bg-rose-50',
    },
    {
      name: 'Blood Pressure',
      value: latestVital?.bloodPressureSystolic ? `${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic} mmHg` : 'Not logged',
      status: latestVital?.bloodPressureSystolic ? (latestVital.bloodPressureSystolic <= 120 ? 'Optimal' : 'Elevated') : '--',
      icon: Activity,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      name: 'Temperature',
      value: latestVital?.temperature ? `${latestVital.temperature} °F` : 'Not logged',
      status: latestVital?.temperature ? (latestVital.temperature <= 99.1 ? 'Normal' : 'Fever') : '--',
      icon: Thermometer,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      name: 'SpO2',
      value: latestVital?.spO2 ? `${latestVital.spO2}%` : 'Not logged',
      status: latestVital?.spO2 ? (latestVital.spO2 >= 95 ? 'Normal' : 'Low') : '--',
      icon: Droplet,
      color: 'text-emerald-500 bg-emerald-50',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Vitals Overview</h3>
        <Link href="/vitals" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          <Plus size={12} /> Log / View Details
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-gray-400">Loading vitals...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {vitalsDisplay.map((vital) => {
            const Icon = vital.icon;
            return (
              <div key={vital.name} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`p-1.5 rounded-lg ${vital.color}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-medium text-gray-500">{vital.name}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 mt-1 truncate">{vital.value}</p>
                <span
                  className={`text-[10px] font-semibold ${
                    vital.status === 'Normal' || vital.status === 'Optimal'
                      ? 'text-emerald-600'
                      : vital.status === '--'
                      ? 'text-gray-400'
                      : 'text-amber-600'
                  }`}
                >
                  {vital.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
