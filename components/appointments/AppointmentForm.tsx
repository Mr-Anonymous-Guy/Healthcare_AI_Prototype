'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, AppointmentInput } from '@/lib/validations/appointments';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, UserCheck, Stethoscope, Calendar, FileText } from 'lucide-react';
import { Appointment } from '@/types/database';

interface AppointmentFormProps {
  initialData?: Appointment | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AppointmentForm({ initialData, onSuccess, onCancel }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorName: initialData?.doctorName || '',
      department: initialData?.department || 'General Medicine',
      appointmentDate: initialData?.appointmentDate
        ? new Date(initialData.appointmentDate).toISOString().slice(0, 16)
        : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: initialData?.notes || '',
      status: initialData?.status || 'SCHEDULED',
    },
  });

  async function onSubmit(data: AppointmentInput) {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/appointments/${initialData.id}` : '/api/appointments';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save appointment');
      }

      toast.success(
        isEditing
          ? 'Appointment updated & confirmation sent'
          : 'Appointment scheduled! Confirmation email sent via Resend'
      );
      reset();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error processing appointment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Doctor Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <UserCheck size={14} className="text-blue-500" />
          Doctor Name *
        </label>
        <input
          type="text"
          placeholder="e.g. Dr. Sarah Jenkins"
          {...register('doctorName')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {errors.doctorName && (
          <p className="text-xs text-red-500 mt-1">{errors.doctorName.message}</p>
        )}
      </div>

      {/* Department / Specialty */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Stethoscope size={14} className="text-purple-500" />
          Department / Specialty
        </label>
        <select
          {...register('department')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        >
          <option value="General Medicine">General Medicine</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Psychiatry">Psychiatry</option>
        </select>
        {errors.department && (
          <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
        )}
      </div>

      {/* Date & Time */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Calendar size={14} className="text-emerald-500" />
          Appointment Date & Time *
        </label>
        <input
          type="datetime-local"
          {...register('appointmentDate')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {errors.appointmentDate && (
          <p className="text-xs text-red-500 mt-1">{errors.appointmentDate.message}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <FileText size={14} className="text-gray-500" />
          Reason / Notes
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Annual routine checkup, persistent chest pain consultation..."
          {...register('notes')}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEditing ? 'Update Appointment' : 'Book Appointment'}
        </button>
      </div>
    </form>
  );
}
