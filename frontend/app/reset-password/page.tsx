'use client';
import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Sprout, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-dark-bg dark:to-dark-surface px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-dark-muted rounded-2xl mb-4">
            <Sprout className="w-7 h-7 text-green-700 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-green-50">Set a new password</h1>
          <p className="text-gray-500 dark:text-green-400 mt-1 text-sm">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-8">
          {success ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-semibold text-gray-900 dark:text-green-50 text-lg">Password reset!</p>
              <p className="text-sm text-gray-500 dark:text-green-400">Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Show token field only if not pre-filled from URL */}
              {!searchParams.get('token') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-green-300 mb-1.5">
                    Reset token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-elevated text-gray-900 dark:text-green-100 placeholder-gray-400 dark:placeholder-green-700 font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                    placeholder="Paste your reset token"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-green-300 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-elevated text-gray-900 dark:text-green-100 placeholder-gray-400 dark:placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-green-300 mb-1.5">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-elevated text-gray-900 dark:text-green-100 placeholder-gray-400 dark:placeholder-green-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                  placeholder="Repeat your new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-500 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-32 text-gray-400">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
