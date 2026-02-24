// NotificationBell Component
// This component renders the notification bell icon - with an unread count badge

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function NotificationBell() {
  // Unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);
  // Whether to show preview dropdown
  const [showPreview, setShowPreview] = useState(false);
  // Recent notifications preview ke liye
  const [recentNotifications, setRecentNotifications] = useState([]);
  // Dropdown ke bahar click detect karne ke liye ref
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
        // Sirf top 3 notifications preview me dikhao
        setRecentNotifications(res.data.notifications.slice(0, 3));
      }
    } catch (error) {
      // Handle error silently - it is okay if an error occurs on the bell
      console.error('Notification fetch error:', error);
    }
  };

  // Check notifications on component mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPreview(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification type ke hisaab se icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'reminder': return 'schedule';
      default: return 'info';
    }
  };

  // Notification type ke hisaab se color
  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'reminder': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="relative flex items-center justify-center rounded-full size-10 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
      >
        <span className="material-symbols-outlined">notifications</span>
        {/* Unread count badge - show only when count > 0 */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full text-white text-[10px] font-bold px-1 border-2 border-background-dark">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Preview dropdown */}
      {showPreview && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          {/* Dropdown header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notification items */}
          <div className="max-h-60 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 ${!notif.is_read ? 'bg-primary/5' : ''
                    }`}
                >
                  <div className={`flex size-8 items-center justify-center rounded-full shrink-0 ${getTypeColor(notif.type)}`}>
                    <span className="material-symbols-outlined text-sm">{getTypeIcon(notif.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{notif.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{notif.message}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="size-2 bg-primary rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">
                  notifications_off
                </span>
                <p className="text-sm text-slate-400 mt-2">No notifications</p>
              </div>
            )}
          </div>

          {/* View all link */}
          <Link
            href="/notifications"
            className="block text-center py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100 dark:border-slate-800"
            onClick={() => setShowPreview(false)}
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
