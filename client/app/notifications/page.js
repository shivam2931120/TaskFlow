// Notifications Page
// yeh page saari notifications dikhata hai - mark as read, delete ke saath

'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loader from '@/components/Loader';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
      toast.error('Notifications could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state - no need to re-fetch
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Saari notifications read mark ho gayi');
    } catch (error) {
      toast.error('Error marking all as read');
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // If deleted an unread notification, decrease the count as well
      if (deleted && !deleted.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Notification delete ho gayi');
    } catch (error) {
      toast.error('Notification could not be deleted');
    }
  };

  // Notification type ke hisaab se icon aur color
  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'reminder': return 'schedule';
      default: return 'info';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'reminder': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  // Time ago format
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-primary font-medium">{unreadCount} unread</p>
            )}
          </div>
          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <Loader text="Loading notifications..." />
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${notif.is_read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-primary/5 dark:bg-primary/5 border-primary/20'
                  }`}
              >
                {/* Type icon */}
                <div className={`flex size-10 items-center justify-center rounded-full shrink-0 ${getTypeColor(notif.type)}`}>
                  <span className="material-symbols-outlined text-xl">{getTypeIcon(notif.type)}</span>
                </div>

                {/* Notification content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{notif.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div className="size-2.5 bg-primary rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                  {/* Time ago aur actions */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-[10px] text-primary font-semibold hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-[10px] text-red-400 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty state - no notifications
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">
              notifications_off
            </span>
            <h3 className="text-lg font-bold mt-4 text-slate-500">No Notifications</h3>
            <p className="text-sm text-slate-400 mt-1">
              Notifications will appear here when there is activity
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
