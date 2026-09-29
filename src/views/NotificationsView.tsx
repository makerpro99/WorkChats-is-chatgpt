import React from 'react';
import { Bell, CheckCheck, MessageSquare, CheckSquare, Megaphone, ShieldAlert, Sparkles } from 'lucide-react';
import { AppNotification } from '../types';
import { api } from '../api';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onRefresh,
}) => {
  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to mark notifications read.');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to mark notification read.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'TASK':
        return <CheckSquare className="w-4 h-4 text-amber-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-rose-600" />;
      case 'MODERATION':
        return <ShieldAlert className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time activity, direct messages, assigned tasks, and system notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-400">
            No notifications right now. You're completely caught up!
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                n.read
                  ? 'bg-white border-zinc-200 text-zinc-600'
                  : 'bg-teal-50/40 border-teal-200 text-zinc-900 shadow-xs cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-xs shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{n.content}</p>
                  <span className="text-[10px] text-zinc-400 block pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
