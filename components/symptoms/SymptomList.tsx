'use client';

import { Symptom } from '@/types/database';
import { Trash2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SymptomListProps {
  symptoms: Symptom[];
  onDeleteSuccess?: () => void;
}

export default function SymptomList({ symptoms, onDeleteSuccess }: SymptomListProps) {
  if (!symptoms || symptoms.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
        <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
        No symptoms logged yet.
      </div>
    );
  }

  function getSeverityBadge(sev: number) {
    if (sev <= 3) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Severity {sev} (Mild)
        </span>
      );
    }
    if (sev <= 6) {
      return (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Severity {sev} (Moderate)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
        Severity {sev} (Severe)
      </span>
    );
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/symptoms/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete symptom');
      }
      toast.success('Symptom entry deleted');
      onDeleteSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete symptom');
    }
  }

  return (
    <div className="space-y-3">
      {symptoms.map((symptom) => (
        <div
          key={symptom.id}
          className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex items-start justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-sm">{symptom.symptomName}</h4>
              {getSeverityBadge(symptom.severity)}
            </div>

            {symptom.duration && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock size={12} className="opacity-70" />
                Duration: {symptom.duration}
              </p>
            )}

            {symptom.notes && (
              <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                {symptom.notes}
              </p>
            )}

            <p className="text-[11px] text-gray-400 mt-1.5">
              Logged on {new Date(symptom.loggedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <button
            onClick={() => handleDelete(symptom.id)}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete symptom"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
