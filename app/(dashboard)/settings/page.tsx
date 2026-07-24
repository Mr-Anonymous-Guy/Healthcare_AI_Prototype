'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User,
  Bell,
  SunMoon,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  Lock,
  Phone,
  Droplet,
  AlertTriangle,
} from 'lucide-react';

interface SettingsData {
  user: {
    id: string;
    email: string;
    role: 'PATIENT' | 'ADMIN' | 'DOCTOR';
  };
  profile: {
    fullName?: string;
    phone?: string;
    bloodType?: string;
    emergencyContact?: string;
    medicalHistory?: string;
    allergies?: string;
  } | null;
  preferences: {
    emailNotifications: boolean;
    appointmentReminders: boolean;
    vitalAlerts: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'theme' | 'security'>('profile');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');

  // Notification Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [vitalAlerts, setVitalAlerts] = useState(true);

  // Theme Preference State
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');

  // Role Toggle State
  const [currentRole, setCurrentRole] = useState<'PATIENT' | 'ADMIN' | 'DOCTOR'>('PATIENT');

  // Fetch Settings Data
  const { data, isLoading, error } = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      if (data.profile) {
        setFullName(data.profile.fullName || '');
        setPhone(data.profile.phone || '');
        setBloodType(data.profile.bloodType || '');
        setEmergencyContact(data.profile.emergencyContact || '');
        setMedicalHistory(data.profile.medicalHistory || '');
        setAllergies(data.profile.allergies || '');
      }
      if (data.user) {
        setCurrentRole(data.user.role);
      }
      if (data.preferences) {
        setEmailNotifications(data.preferences.emailNotifications);
        setAppointmentReminders(data.preferences.appointmentReminders);
        setVitalAlerts(data.preferences.vitalAlerts);
        setThemeMode(data.preferences.theme);
      }
    }
  }, [data]);

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update settings');
      }

      return res.json();
    },
    onSuccess: (responseData) => {
      toast.success('Settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      if (responseData.role) {
        setCurrentRole(responseData.role);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error updating settings');
    },
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      fullName,
      phone,
      bloodType,
      emergencyContact,
      medicalHistory,
      allergies,
      emailNotifications,
      appointmentReminders,
      vitalAlerts,
      theme: themeMode,
      roleToggle: currentRole,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading user settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200">
        <p className="font-semibold">Error loading settings</p>
        <p className="text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account & System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal profile, notification triggers, system theme, and access roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Current Role:</span>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              currentRole === 'ADMIN'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : currentRole === 'DOCTOR'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {currentRole}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Preferences
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'theme'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <SunMoon className="w-4 h-4" />
          Appearance & Theme
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security & Roles
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Profile Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Blood Type
                </label>
                <div className="relative">
                  <Droplet className="w-4 h-4 text-red-500 absolute left-3.5 top-3" />
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="">Select blood type...</option>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="Name and Phone Number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Medical History Summary
                </label>
                <textarea
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="Known chronic conditions, prior surgeries..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Known Allergies
                </label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="Food, drug, or environmental allergies..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Notification & Alert Triggers
            </h2>

            <div className="space-y-4 divide-y divide-gray-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Email Confirmations</h3>
                  <p className="text-xs text-gray-500">
                    Receive email notifications when appointments are scheduled or updated via Resend API.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Appointment Reminders</h3>
                  <p className="text-xs text-gray-500">
                    In-app notifications for upcoming doctor consultations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={appointmentReminders}
                  onChange={(e) => setAppointmentReminders(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Health Vital Alerts</h3>
                  <p className="text-xs text-gray-500">
                    Receive notifications when logged blood pressure or blood sugar exceeds healthy limits.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={vitalAlerts}
                  onChange={(e) => setVitalAlerts(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <SunMoon className="w-5 h-5 text-blue-600" /> Interface Theme
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                  themeMode === 'light'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <SunMoon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm block">Light Mode</span>
                  <span className="text-xs text-gray-500">Clean high-contrast theme</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                  themeMode === 'dark'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm block">Dark Mode</span>
                  <span className="text-xs text-gray-500">Low-light comfortable view</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('system')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                  themeMode === 'system'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm block">System Auto</span>
                  <span className="text-xs text-gray-500">Follow device settings</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Security & Role Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" /> Account Security & Role Management
            </h2>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Assigned System Role
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  data?.user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {data?.user.role || 'PATIENT'}
                </span>
                <span className="text-xs text-gray-500">
                  (Roles are strictly managed by system administrators)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Account Email Address
              </label>
              <input
                type="text"
                value={data?.user.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
