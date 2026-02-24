// ProtectedRoute Component
// This component wraps protected pages - redirects unauthenticated users

'use client';

import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <Loader size="large" text="Authenticating..." />
      </div>
    );
  }

  // If user is not logged in - middleware will handle redirect
  // but check here as well for safety
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <Loader size="large" text="Redirecting to login..." />
      </div>
    );
  }

  // User is authenticated - show page content with navbar and sidebar
  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
