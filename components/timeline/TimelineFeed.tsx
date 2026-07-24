'use client';

import { TimelineItem } from '@/app/api/timeline/route';
import { Activity, FileText, AlertCircle, Notebook, Calendar } from 'lucide-react';

interface TimelineFeedProps {
  timeline: TimelineItem[];
  isLoading?: boolean;
}

export default function TimelineFeed({ timeline, isLoading }: TimelineFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-150 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
        <Calendar size={28} className="mx-auto mb-2 opacity-40" />
        <p className="font-medium text-gray-600">No health timeline activity yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          Log vitals, track symptoms, or upload medical reports to see them aggregated here.
        </p>
      </div>
    );
  }

  function getIcon(type: TimelineItem['type']) {
    switch (type) {
      case 'VITAL':
        return <Activity size={16} className="text-blue-600" />;
      case 'SYMPTOM':
        return <AlertCircle size={16} className="text-purple-600" />;
      case 'REPORT':
        return <FileText size={16} className="text-emerald-600" />;
      case 'LOG':
        return <Notebook size={16} className="text-amber-600" />;
    }
  }

  function getBadgeColor(type: TimelineItem['type']) {
    switch (type) {
      case 'VITAL':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'SYMPTOM':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'REPORT':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'LOG':
        return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
      {timeline.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node Circle */}
          <div className="absolute -left-6 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center group-hover:border-blue-500 transition-colors shadow-xs">
            <span className="scale-75">{getIcon(item.type)}</span>
          </div>

          {/* Content Card */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getBadgeColor(item.type)}`}>
                {item.type}
              </span>
            </div>

            {item.subtitle && (
              <p className="text-xs text-gray-600 font-medium">{item.subtitle}</p>
            )}

            {item.details && item.details.notes && (
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100 italic">
                &quot;{item.details.notes}&quot;
              </p>
            )}

            <p className="text-[11px] text-gray-400 mt-2">
              {new Date(item.timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
