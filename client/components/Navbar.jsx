// Navbar Component
// This component renders the top navigation bar - visible on all protected pages

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 justify-between border-b border-primary/10">
      {/* Left side - Logo aur user greeting */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">task_alt</span>
          <span className="text-lg font-bold tracking-tight hidden sm:block">TaskFlow</span>
        </Link>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <NotificationBell />

        {/* User profile dropdown */}
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <span className="text-sm font-semibold hidden sm:block">{user?.name || 'User'}</span>
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center justify-center rounded-full size-10 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </header>
  );
}
