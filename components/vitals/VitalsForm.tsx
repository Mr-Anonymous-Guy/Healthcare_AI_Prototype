'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vitalSchema, VitalInput } from '@/lib/validations/vitals';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, Heart, Activity, Thermometer, Droplet, Wind, Calendar } from 'lucide-react';

interface VitalsFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VitalsForm({ onSuccess, onCancel }: VitalsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VitalInput>({
    resolver: zodResolver(vitalSchema),
    defaultValues: {
      recordedAt: new Date().toISOString().slice(0, 16),
    },
  });

  async function onSubmit(data: VitalInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to record vitals');
      }

      toast.success('Vitals recorded successfully');
      reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error saving vitals');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Heart Rate */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Heart size={14} className="text-red-500" />
            Heart Rate (bpm)
          </label>
          <input
            type="number"
            placeholder="e.g. 72"
            {...register('heartRate')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.heartRate && (
            <p className="text-xs text-red-500 mt-1">{errors.heartRate.message}</p>
          )}
        </div>

        {/* Blood Pressure Systolic */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Activity size={14} className="text-indigo-500" />
            BP Systolic (mmHg)
          </label>
          <input
            type="number"
            placeholder="e.g. 120"
            {...register('bloodPressureSystolic')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.bloodPressureSystolic && (
            <p className="text-xs text-red-500 mt-1">{errors.bloodPressureSystolic.message}</p>
          )}
        </div>

        {/* Blood Pressure Diastolic */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Activity size={14} className="text-purple-500" />
            BP Diastolic (mmHg)
          </label>
          <input
            type="number"
            placeholder="e.g. 80"
            {...register('bloodPressureDiastolic')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.bloodPressureDiastolic && (
            <p className="text-xs text-red-500 mt-1">{errors.bloodPressureDiastolic.message}</p>
          )}
        </div>

        {/* Glucose */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Droplet size={14} className="text-amber-500" />
            Blood Glucose (mg/dL)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 95.5"
            {...register('glucose')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.glucose && (
            <p className="text-xs text-red-500 mt-1">{errors.glucose.message}</p>
          )}
        </div>

        {/* Temperature */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Thermometer size={14} className="text-orange-500" />
            Temperature (°F)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 98.6"
            {...register('temperature')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.temperature && (
            <p className="text-xs text-red-500 mt-1">{errors.temperature.message}</p>
          )}
        </div>

        {/* Oxygen Saturation */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Wind size={14} className="text-teal-500" />
            SpO2 (%)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 98"
            {...register('spO2')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.spO2 && <p className="text-xs text-red-500 mt-1">{errors.spO2.message}</p>}
        </div>
      </div>

      {/* Date & Time */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-500" />
          Recorded Date & Time
        </label>
        <input
          type="datetime-local"
          {...register('recordedAt')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Form level error */}
      {errors.root && <p className="text-xs text-red-500">{errors.root.message}</p>}

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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Vitals'}
        </button>
      </div>
    </form>
  );
}
