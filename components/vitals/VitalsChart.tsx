'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Vital } from '@/types/database';

interface VitalsChartProps {
  vitals: Vital[];
  metric?: 'all' | 'heartRate' | 'bloodPressure' | 'glucose' | 'spO2';
}

export default function VitalsChart({ vitals, metric = 'all' }: VitalsChartProps) {
  if (!vitals || vitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
        <p>No vitals recorded yet.</p>
        <p className="text-xs text-gray-400 mt-1">Log your first vital sign to view trend charts.</p>
      </div>
    );
  }

  // Format data chronological for chart (oldest to newest)
  const chartData = [...vitals]
    .reverse()
    .map((v) => ({
      date: new Date(v.recordedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      heartRate: v.heartRate ?? undefined,
      systolic: v.bloodPressureSystolic ?? undefined,
      diastolic: v.bloodPressureDiastolic ?? undefined,
      glucose: v.glucose ?? undefined,
      spO2: v.spO2 ?? undefined,
      temp: v.temperature ?? undefined,
    }));

  return (
    <div className="w-full h-72 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              borderColor: '#e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

          {(metric === 'all' || metric === 'heartRate') && (
            <Line
              type="monotone"
              dataKey="heartRate"
              name="Heart Rate (bpm)"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}

          {(metric === 'all' || metric === 'bloodPressure') && (
            <>
              <Line
                type="monotone"
                dataKey="systolic"
                name="BP Systolic (mmHg)"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="BP Diastolic (mmHg)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </>
          )}

          {(metric === 'all' || metric === 'glucose') && (
            <Line
              type="monotone"
              dataKey="glucose"
              name="Glucose (mg/dL)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          )}

          {(metric === 'all' || metric === 'spO2') && (
            <Line
              type="monotone"
              dataKey="spO2"
              name="SpO2 (%)"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
