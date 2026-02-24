// Sidebar Component
// This component renders the side navigation - visible on desktop

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // List of navigation items
  const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/tasks', icon: 'checklist', label: 'Tasks' },
    { href: '/notifications', icon: 'notifications', label: 'Notifications' },
    { href: '/profile', icon: 'account_circle', label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop sidebar - bade screens pe dikhta hai */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-slate-200 dark:border-primary/10 bg-background-light dark:bg-background-dark p-4">
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            // Check if current page is active
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? 'filled-icon' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom navigation - chhote screens pe dikhta hai */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t border-slate-200 dark:border-slate-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg px-4 pb-6 pt-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary'
                }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'filled-icon' : ''}`}>
                {item.icon}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
