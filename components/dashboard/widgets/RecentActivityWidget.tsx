'use client';

import { Activity, FileText, AlertCircle, Notebook } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TimelineItem } from '@/app/api/timeline/route';
import Link from 'next/link';

export default function RecentActivityWidget() {
  const { data, isLoading } = useQuery<{ timeline: TimelineItem[] }>({
    queryKey: ['timeline-widget'],
    queryFn: async () => {
      const res = await fetch('/api/timeline?limit=4');
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    },
  });

  const activities = data?.timeline || [];

  function getIconAndColor(type: TimelineItem['type']) {
    switch (type) {
      case 'VITAL':
        return { icon: Activity, color: 'bg-blue-100 text-blue-600' };
      case 'SYMPTOM':
        return { icon: AlertCircle, color: 'bg-purple-100 text-purple-600' };
      case 'REPORT':
        return { icon: FileText, color: 'bg-emerald-100 text-emerald-600' };
      case 'LOG':
        return { icon: Notebook, color: 'bg-amber-100 text-amber-600' };
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
        <Link href="/vitals" className="text-xs font-semibold text-blue-600 hover:underline">
          View Timeline
        </Link>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400">Loading recent activity...</div>
      ) : activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">No activity recorded yet.</div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => {
            const { icon: Icon, color } = getIconAndColor(act.type);
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{act.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{act.subtitle}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(act.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
