'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowLeft,
  Loader2,
  Clock,
  User,
  Activity,
  Lock,
  Search,
} from 'lucide-react';
import { useState } from 'react';

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  actor?: {
    email: string;
    role: string;
  } | null;
}

export default function AuditLogsPage() {
  const [filterAction, setFilterAction] = useState('');

  const { data, isLoading, error } = useQuery<{ logs: AuditLogEntry[] }>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/audit-logs');
      if (res.status === 403) throw new Error('FORBIDDEN');
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
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
          Viewing system audit logs requires an administrative role.
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
        <p className="text-sm font-medium">Fetching system audit trail logs...</p>
      </div>
    );
  }

  const logs = data?.logs || [];
  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filterAction.toLowerCase()) ||
      log.resource.toLowerCase().includes(filterAction.toLowerCase()) ||
      (log.actor?.email || '').toLowerCase().includes(filterAction.toLowerCase())
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
            <ShieldAlert className="w-6 h-6 text-purple-600" /> Audit Log Viewer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete security and administration trail tracking sensitive system activities.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter by action or email..."
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No audit logs matching your filter query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.actor ? (
                        <div>
                          <span className="font-semibold text-gray-900 block text-xs">
                            {log.actor.email}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">
                            {log.actor.role}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">System Event</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-700 whitespace-nowrap">
                      {log.resource}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {log.details ? (
                        <pre className="text-[11px] bg-gray-50 p-1.5 rounded border border-gray-100 font-mono overflow-x-auto max-w-xs">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        <span className="italic text-gray-400">None</span>
                      )}
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
