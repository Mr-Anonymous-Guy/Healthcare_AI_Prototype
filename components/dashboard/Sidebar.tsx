'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  FileText,
  Activity,
  Calendar,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  MessageCircle,
  Users,
  FolderOpen,
  CalendarDays,
  ActivitySquare,
  Bot,
  BellRing,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole = 'PATIENT' }: SidebarProps) {
  const pathname = usePathname();
  const { isSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse, closeSidebar } =
    useDashboardStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const patientNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Medical Reports', href: '/medical-records', icon: FileText },
    { name: 'AI Chat Assistant', href: '/chat', icon: MessageCircle },
    { name: 'Vitals & Symptoms', href: '/vitals', icon: Activity },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
  ];

  const adminNav = [
    { name: 'System Overview', href: '/admin', icon: ShieldAlert },
    { name: 'User Directory', href: '/admin/users', icon: Users },
    { name: 'Medical Files', href: '/admin/files', icon: FolderOpen },
    { name: 'Appointments Log', href: '/admin/appointments', icon: CalendarDays },
    { name: 'Health Analytics', href: '/admin/vitals', icon: ActivitySquare },
    { name: 'AI Chat Sessions', href: '/admin/ai-sessions', icon: Bot },
    { name: 'Notifications Log', href: '/admin/notifications', icon: BellRing },
    { name: 'Security Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  ];

  const isAdmin = userRole === 'ADMIN';

  // The sidebar is visually expanded if it's not collapsed OR if it's currently hovered on desktop
  const isVisualExpanded = isMobile || !isSidebarCollapsed || isHovered;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          width: isVisualExpanded ? 256 : 80,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isVisualExpanded && isSidebarCollapsed ? 'shadow-2xl ring-1 ring-black/5' : ''}`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center ${
            isVisualExpanded ? 'justify-between px-4' : 'justify-center'
          } border-b border-gray-100 shrink-0`}
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <AnimatePresence initial={false}>
              {isVisualExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="font-bold text-gray-900 text-lg tracking-tight leading-none block">
                    HealthAI
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest block mt-0.5">
                    Assistant
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {isVisualExpanded && (
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar permanently' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Patient Modules Section */}
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {isVisualExpanded ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 whitespace-nowrap overflow-hidden"
                >
                  Patient Portal
                </motion.p>
              ) : (
                <div className="h-6" />
              )}
            </AnimatePresence>
            {patientNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${!isVisualExpanded ? 'justify-center px-0' : ''}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <AnimatePresence initial={false}>
                    {isVisualExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {!isVisualExpanded && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-md z-[60] border border-slate-800 translate-x-2 group-hover:translate-x-0">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Operations Section (Only rendered for ADMIN role) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-gray-100">
              <AnimatePresence initial={false}>
                {isVisualExpanded ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5 whitespace-nowrap overflow-hidden"
                  >
                    <ShieldAlert className="w-3 h-3 text-indigo-600 shrink-0" /> Admin Operations
                  </motion.p>
                ) : (
                  <div className="h-6" />
                )}
              </AnimatePresence>
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm font-bold border border-indigo-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${!isVisualExpanded ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <AnimatePresence initial={false}>
                      {isVisualExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {!isVisualExpanded && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-md z-[60] border border-slate-800 translate-x-2 group-hover:translate-x-0">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="p-3 border-t border-gray-100 shrink-0">
          <Link
            href="/settings"
            className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50 transition-colors ${
              !isVisualExpanded ? 'justify-center px-0' : ''
            }`}
          >
            <Settings className="w-5 h-5 text-gray-400 shrink-0" />
            <AnimatePresence initial={false}>
              {isVisualExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip for collapsed state */}
            {!isVisualExpanded && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-md z-[60] border border-slate-800 translate-x-2 group-hover:translate-x-0">
                Settings
              </div>
            )}
          </Link>
        </div>
      </motion.aside>
    </>
  );
}
