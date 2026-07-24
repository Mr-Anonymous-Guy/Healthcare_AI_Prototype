'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, X, Calendar, Activity, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '@/types/database';
import { toast } from 'sonner';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 15000, // Auto refresh every 15s
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  async function markAllAsRead() {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to mark all as read');
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      toast.error('Failed to update notifications');
    }
  }

  async function toggleRead(id: string, currentReadStatus: boolean) {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentReadStatus }),
      });
      if (!res.ok) throw new Error('Failed to update notification');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      toast.error('Failed to update notification');
    }
  }

  async function deleteNotification(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete notification');
      toast.success('Notification removed');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      toast.error('Failed to delete notification');
    }
  }

  function getNotificationIcon(type: Notification['type']) {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'VITALS_ALERT':
        return <Activity className="w-4 h-4 text-amber-600" />;
      case 'SYSTEM':
        return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/40 z-50 transition-opacity" onClick={onClose} />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                  n.isRead ? 'bg-white border-gray-150 text-gray-700' : 'bg-blue-50/50 border-blue-100 text-gray-900 shadow-2xs'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-gray-100 shrink-0 mt-0.5 shadow-2xs">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`font-semibold truncate ${n.isRead ? 'text-gray-800' : 'text-blue-950 font-bold'}`}>
                      {n.title}
                    </h4>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>

                  <p className="text-gray-600 leading-relaxed text-[11px]">{n.message}</p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100/60">
                    <span>
                      {new Date(n.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRead(n.id, n.isRead)}
                        className="hover:text-blue-600 underline transition-colors"
                      >
                        {n.isRead ? 'Mark unread' : 'Mark read'}
                      </button>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
