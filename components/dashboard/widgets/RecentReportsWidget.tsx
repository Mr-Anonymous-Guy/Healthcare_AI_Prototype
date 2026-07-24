'use client';

import { FileText, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function RecentReportsWidget() {
  const mockReports = [
    {
      id: '1',
      title: 'Complete Blood Count (CBC)',
      type: 'Lab Test',
      date: 'July 20, 2026',
      status: 'PROCESSED',
    },
    {
      id: '2',
      title: 'Chest X-Ray Screening',
      type: 'Radiology',
      date: 'July 14, 2026',
      status: 'PROCESSED',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Reports</h3>
        <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
          <FileText className="w-5 h-5" />
        </span>
      </div>

      <div className="space-y-3">
        {mockReports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">{report.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{report.type} • {report.date}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Ready
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          href="/medical-records"
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1"
        >
          Manage all records →
        </Link>
      </div>
    </div>
  );
}
