'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { signOutAction } from '@/lib/auth/actions';
import { Menu, Bell, Search, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import NotificationDrawer from '@/components/dashboard/NotificationDrawer';

interface NavbarProps {
  user: {
    email: string;
    role: string;
    fullName?: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const { toggleSidebar, isSidebarCollapsed } = useDashboardStore();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { data: notifData } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications-badge'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 15000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
          {/* Left Side: Mobile Menu Button & Search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-label="Open Mobile Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative max-w-xs w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports, vitals, doctors..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Side: Notifications & User Menu */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
              {user.role}
            </span>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Quick Link */}
            <Link
              href="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {user.fullName || 'User Profile'}
                </p>
                <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user.email}</p>
              </div>
            </Link>

            {/* Sign Out Button */}
            <form action={signOutAction}>
              <button
                type="submit"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  );
}
