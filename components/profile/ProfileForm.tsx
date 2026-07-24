'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileInput } from '@/lib/validations/profile';
import { updateProfileAction } from '@/lib/actions/profileActions';
import { toast } from 'sonner';
import { User, Phone, Calendar, Heart, Shield, Save } from 'lucide-react';

interface ProfileFormProps {
  initialProfile: {
    fullName?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodType?: string | null;
    emergencyContact?: string | null;
    medicalHistory?: string | null;
    allergies?: string | null;
  } | null;
  userEmail: string;
  userRole: string;
}

export default function ProfileForm({ initialProfile, userEmail, userRole }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialProfile?.fullName || '',
      phone: initialProfile?.phone || '',
      dateOfBirth: initialProfile?.dateOfBirth ? initialProfile.dateOfBirth.split('T')[0] : '',
      gender: initialProfile?.gender || '',
      bloodType: initialProfile?.bloodType || '',
      emergencyContact: initialProfile?.emergencyContact || '',
      medicalHistory: initialProfile?.medicalHistory || '',
      allergies: initialProfile?.allergies || '',
    },
  });

  const onSubmit = (data: ProfileInput) => {
    startTransition(async () => {
      const res = await updateProfileAction(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Profile saved successfully!');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Account Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
            <input
              type="text"
              value={userEmail}
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl w-fit">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">{userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-blue-600" />
          Personal & Medical Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              {...form.register('fullName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              {...form.register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              {...form.register('dateOfBirth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
            <select
              {...form.register('gender')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Type</label>
            <select
              {...form.register('bloodType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact</label>
            <input
              type="text"
              placeholder="Jane Doe (+1 555-9999)"
              {...form.register('emergencyContact')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Known Allergies</label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts"
              {...form.register('allergies')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Medical History Notes</label>
            <textarea
              rows={3}
              placeholder="Brief summary of past conditions, surgeries, or chronic illnesses..."
              {...form.register('medicalHistory')}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isPending ? 'Saving Profile...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
}
