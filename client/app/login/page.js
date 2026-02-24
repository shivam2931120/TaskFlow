// Login Page
// yeh page user ko login karne deta hai - email aur password se

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email required hai';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email daalo';
    if (!password) newErrors.password = 'Password required hai';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center bg-transparent p-4 pb-2 justify-between">
        {/* <Link href="/" className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link> */}
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          TaskFlow
        </h2>
      </div>

      {/* Login Form */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 pb-12">
        <div className="w-full max-w-[400px] bg-white dark:bg-slate-900/50 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Header text */}
          <div className="mb-8 text-center">
            <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight pb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-normal">
              Sign in to manage your productivity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-none">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                className="flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 text-base font-normal"
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-none">
                  Password
                </label>
              </div>
              <div className="relative flex w-full items-stretch">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                  }}
                  className="flex w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 pr-12 text-base font-normal"
                  placeholder="••••••••"
                />
                {/* Password visibility toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold text-base h-14 rounded-lg transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">TaskFlow</span>
            </div>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Don&apos;t have an account?
            <Link href="/register" className="text-primary font-bold hover:underline ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-slate-500 text-xs">
        <p>© 2026 TaskFlow. All rights reserved.</p>
      </div>
    </div>
  );
}
