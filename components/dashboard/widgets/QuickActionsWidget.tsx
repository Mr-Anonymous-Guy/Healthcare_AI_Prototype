'use client';

import { Activity, PlusCircle, Upload, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function QuickActionsWidget() {
  const actions = [
    { name: 'Log Vitals', href: '/vitals', icon: Activity, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { name: 'Track Symptom', href: '/vitals', icon: PlusCircle, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
    { name: 'Upload Report', href: '/medical-records', icon: Upload, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { name: 'Book Visit', href: '/appointments', icon: Calendar, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.name}
              href={act.href}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border border-gray-100 font-medium text-xs transition-colors text-center ${act.color}`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <span>{act.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
