// Dashboard Page
// yeh page main analytics dashboard dikhata hai - stats, charts, recent tasks, suggestions

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import StatsCard from '@/components/StatsCard';
import Loader from '@/components/Loader';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Simple bar chart component - no need for Recharts, building a custom one
function WeeklyChart({ data = [] }) {
  // Find maximum value - for chart scaling
  const maxValue = Math.max(...data.map((d) => d.tasks), 1);

  // Find today's day
  const today = new Date().getDay(); // 0 = Sun, 1 = Mon, ...

  return (
    <div className="bg-slate-100 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Weekly Productivity</h3>
      </div>
      {/* Bar chart */}
      <div className="h-32 w-full flex items-end justify-between gap-2 px-1">
        {data.map((item, index) => {
          // Calculate bar height percentage
          const heightPercent = maxValue > 0 ? (item.tasks / maxValue) * 100 : 5;
          const isToday = index === today;
          return (
            <div
              key={item.day}
              className={`w-full rounded-t-sm transition-all duration-500 ${isToday
                ? 'bg-primary shadow-[0_0_15px_rgba(17,212,115,0.3)]'
                : 'bg-primary/20'
                }`}
              style={{ height: `${Math.max(heightPercent, 5)}%` }}
              title={`${item.day}: ${item.tasks} tasks`}
            />
          );
        })}
      </div>
      {/* Day labels */}
      <div className="flex justify-between mt-3 px-1 text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
        {data.map((item) => (
          <span key={item.day}>{item.day}</span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  // Dashboard data states
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await api.get('/tasks/dashboard/stats');

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Dashboard data could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);



  // Format time for recent activity
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
    return `${diffDays}d ago`;
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <Loader size="large" text="Dashboard load ho raha hai..." />
      ) : (
        <div className="px-4 lg:px-8 py-6">
          {/* Welcome header */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 dark:text-primary/70 font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold tracking-tight">{user?.name || 'User'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Here&apos;s your progress for today</p>
          </div>

          {/* Stats Cards - horizontal scroll on mobile */}
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
            <StatsCard
              icon="assignment"
              label="Total Tasks"
              value={stats?.totalTasks || 0}
              color="primary"
            />
            <StatsCard
              icon="check_circle"
              label="Completed"
              value={stats?.completedTasks || 0}
              color="blue"
            />
            <StatsCard
              icon="pending"
              label="Pending"
              value={stats?.pendingTasks || 0}
              color="amber"
            />
            <StatsCard
              icon="warning"
              label="Overdue"
              value={stats?.overdueTasks || 0}
              color="red"
            />
          </div>

          {/* Weekly Productivity Chart */}
          <div className="mt-6">
            <WeeklyChart data={stats?.weeklyProductivity || []} />
          </div>



          {/* Recent Activity */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <Link href="/tasks" className="text-primary text-sm font-semibold hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentTasks?.length > 0 ? (
                stats.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50"
                  >
                    {/* Status icon */}
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${task.status === 'completed'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {task.status === 'completed' ? 'done_all' : 'pending'}
                      </span>
                    </div>
                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{task.title}</p>
                      <p className="text-xs text-slate-500">{formatTimeAgo(task.created_at)}</p>
                    </div>
                    {/* Status badge */}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${task.status === 'completed'
                        ? 'bg-green-500/10 text-green-500'
                        : 'text-amber-500'
                        }`}
                    >
                      {task.status === 'completed' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="text-center py-12 rounded-xl bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700">
                    checklist
                  </span>
                  <p className="text-sm text-slate-400 mt-3">No tasks yet. Create your first task!</p>
                  <Link
                    href="/tasks"
                    className="inline-block mt-4 px-6 py-2 bg-primary text-background-dark text-sm font-bold rounded-lg"
                  >
                    Add Task
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
