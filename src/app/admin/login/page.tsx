'use client';

// -----------------------------------------------------------------------------
// Admin login. Posts credentials to /api/auth/login, which sets the HttpOnly
// cookie server-side; on success we route to the dashboard. Styled as a focused,
// centered card on the #050505 brand base — same type and border language as the
// public site, nothing template-y.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { login } from '@/api/admin/auth';
import { ApiError } from '@/api/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace('/admin');
    } catch (err) {
      // 401 → wrong credentials; anything else → surface the message we got.
      const msg =
        err instanceof ApiError && err.status === 401
          ? 'Invalid username or password.'
          : err instanceof Error
            ? err.message
            : 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex items-center gap-3">
          <img src="/assets/logo.png" alt="" className="h-9 w-9 object-contain" />
          <div className="flex flex-col font-['Space_Grotesk'] text-sm font-bold uppercase leading-[1.1] tracking-wide text-white">
            <span>Abbas Skaiki</span>
            <span className="text-zinc-500">Admin Console</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-6"
        >
          <div className="space-y-2">
            <label className="block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-[var(--radius-md)] border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-[var(--radius-md)] border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/30"
            />
          </div>

          {error && (
            <p className="rounded-[var(--radius-md)] border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-3 py-2 font-mono text-[11px] text-[#ff6b81]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[var(--radius-md)] bg-white px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
