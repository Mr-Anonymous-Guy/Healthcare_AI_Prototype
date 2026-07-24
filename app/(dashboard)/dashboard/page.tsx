import { requireAuth } from '@/lib/auth/session';
import HealthScoreWidget from '@/components/dashboard/widgets/HealthScoreWidget';
import UpcomingAppointmentWidget from '@/components/dashboard/widgets/UpcomingAppointmentWidget';
import RecentReportsWidget from '@/components/dashboard/widgets/RecentReportsWidget';
import SymptomsWidget from '@/components/dashboard/widgets/SymptomsWidget';
import VitalsWidget from '@/components/dashboard/widgets/VitalsWidget';
import AISuggestionsWidget from '@/components/dashboard/widgets/AISuggestionsWidget';
import QuickActionsWidget from '@/components/dashboard/widgets/QuickActionsWidget';
import RecentActivityWidget from '@/components/dashboard/widgets/RecentActivityWidget';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Health Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-gray-800">{user.fullName || user.email}</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-700 w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          Active Account ({user.role})
        </div>
      </div>

      {/* Quick Actions Header Row */}
      <QuickActionsWidget />

      {/* Grid Layout Row 1: Health Score, Upcoming Appointment, Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthScoreWidget />
        <UpcomingAppointmentWidget />
        <VitalsWidget />
      </div>

      {/* Grid Layout Row 2: AI Suggestions & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AISuggestionsWidget />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <RecentReportsWidget />
          <SymptomsWidget />
        </div>
      </div>

      {/* Grid Layout Row 3: Recent Activity Feed */}
      <RecentActivityWidget />
    </div>
  );
}
