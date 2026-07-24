'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Users,
  ArrowLeft,
  Loader2,
  Lock,
  Search,
  UserCheck,
  Shield,
  FileText,
  Calendar,
  Activity,
} from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  role: 'PATIENT' | 'ADMIN' | 'DOCTOR';
  createdAt: string;
  profile?: {
    fullName?: string;
    phone?: string;
    bloodType?: string;
  } | null;
  _count: {
    medicalReports: number;
    appointments: number;
    vitals: number;
    symptoms: number;
  };
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery<{ users: UserItem[] }>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) throw new Error('FORBIDDEN');
      if (!res.ok) throw new Error('Failed to fetch user directory');
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update user role');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update user role');
    },
  });

  if (error && (error as Error).message === 'FORBIDDEN') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-sm text-gray-600">
          User management capabilities are restricted to system administrators.
        </p>
        <Link
          href="/settings"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Go to Settings & Enable Admin Role
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Fetching registered user accounts...</p>
      </div>
    );
  }

  const users = data?.users || [];
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.profile?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> User Accounts & Role Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Directory of registered system users, activity breakdown, and role permissions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No user accounts found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3.5 px-4">User Info</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Activity Stats</th>
                  <th className="py-3.5 px-4">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 hover:underline block"
                        >
                          {user.profile?.fullName || 'Anonymous Profile'}
                        </Link>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : user.role === 'DOCTOR'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1" title="Medical Reports">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" /> {user._count.medicalReports}
                        </span>
                        <span className="flex items-center gap-1" title="Appointments">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" /> {user._count.appointments}
                        </span>
                        <span className="flex items-center gap-1" title="Vitals Logged">
                          <Activity className="w-3.5 h-3.5 text-blue-600" /> {user._count.vitals}
                        </span>
                        <span className="flex items-center gap-1" title="Symptoms Logged">
                          <UserCheck className="w-3.5 h-3.5 text-amber-600" /> {user._count.symptoms}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        disabled={roleMutation.isPending}
                        onChange={(e) =>
                          roleMutation.mutate({
                            userId: user.id,
                            role: e.target.value,
                          })
                        }
                        className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="PATIENT">PATIENT</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="DOCTOR">DOCTOR</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
