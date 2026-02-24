// Profile Page
// This page shows user profile details - with edit profile and change password

'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Whether success toast has been shown
  const [showToast, setShowToast] = useState(false);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Profile update handler
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/users/profile', { name: name.trim(), email: email.trim() });
      if (res.data.success) {
        toast.success('Profile updated!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile could not be updated');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Validation
    if (!currentPassword || !newPassword) {
      toast.error('Both passwords are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password kam se kam 6 characters ka hona chahiye');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password could not be changed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
        {/* Success Toast inline */}
        {showToast && (
          <div className="mb-4 flex flex-row items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold leading-tight">Changes saved</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your profile is up to date.</p>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-xs font-bold uppercase tracking-wider text-primary"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Profile Hero */}
        <div className="flex flex-col items-center py-6">
          <div className="relative group">
            <div className="size-32 rounded-full bg-primary/20 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-5xl text-primary">person</span>
            </div>
            <div className="absolute bottom-1 right-1 bg-primary text-background-dark p-1.5 rounded-full border-2 border-background-dark shadow-sm">
              <span className="material-symbols-outlined text-sm block">edit</span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-4">
            <p className="text-xl font-bold tracking-tight">{user?.name || 'User'}</p>
            <p className="text-sm text-primary font-medium">{user?.email || ''}</p>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-4 px-1">
              Personal Details
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium outline-none"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium outline-none"
                />
              </div>

              {/* Update button */}
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Security Section - Password Change */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-4 px-1">
              Security
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium outline-none pr-12"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showCurrentPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium outline-none pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNewPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Change password button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Account info */}
          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-slate-400">
              Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
