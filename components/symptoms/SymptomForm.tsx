'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { symptomSchema, SymptomInput } from '@/lib/validations/symptoms';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, Activity, Clock, FileText, AlertCircle } from 'lucide-react';

interface SymptomFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SymptomForm({ onSuccess, onCancel }: SymptomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SymptomInput>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      severity: 5,
      loggedAt: new Date().toISOString().slice(0, 16),
    },
  });

  const severityValue = watch('severity', 5);

  function getSeverityColor(sev: number) {
    if (sev <= 3) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (sev <= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  }

  async function onSubmit(data: SymptomInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to log symptom');
      }

      toast.success('Symptom logged successfully');
      reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error logging symptom');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Symptom Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Activity size={14} className="text-purple-500" />
          Symptom Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Headache, Joint Pain, Fatigue..."
          {...register('symptomName')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        {errors.symptomName && (
          <p className="text-xs text-red-500 mt-1">{errors.symptomName.message}</p>
        )}
      </div>

      {/* Severity Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-500" />
            Severity Scale (1 - 10) *
          </label>
          <span
            className={`px-2 py-0.5 text-xs font-bold rounded border ${getSeverityColor(
              Number(severityValue)
            )}`}
          >
            {severityValue} / 10
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          {...register('severity')}
          className="w-full accent-purple-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>Mild (1-3)</span>
          <span>Moderate (4-6)</span>
          <span>Severe (7-10)</span>
        </div>
        {errors.severity && (
          <p className="text-xs text-red-500 mt-1">{errors.severity.message}</p>
        )}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Clock size={14} className="text-blue-500" />
          Duration
        </label>
        <input
          type="text"
          placeholder="e.g. 2 hours, 3 days, intermittent..."
          {...register('duration')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        {errors.duration && (
          <p className="text-xs text-red-500 mt-1">{errors.duration.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <FileText size={14} className="text-gray-500" />
          Notes / Triggers
        </label>
        <textarea
          rows={2}
          placeholder="Additional context, potential triggers, or observations..."
          {...register('notes')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
        />
        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
      </div>

      {/* Logged Date */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Date & Time</label>
        <input
          type="datetime-local"
          {...register('loggedAt')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Log Symptom'}
        </button>
      </div>
    </form>
  );
}
