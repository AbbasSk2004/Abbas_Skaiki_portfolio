'use client';

// -----------------------------------------------------------------------------
// Admin dashboard home — KPI counters + custom SVG analytics + activity feed.
//
// Every chart is hand-rendered (see components/Charts.tsx) on the existing
// --chart-1..5 design tokens, so the analytics match the site palette exactly
// and add zero dependencies to the bundle. Data comes from one authenticated
// call to GET /api/admin/stats.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '@/api/admin/stats';
import { ApiError } from '@/api/api';
import { BarList, Donut, TrendLine } from './components/Charts';

// Headline counters shown across the top of the dashboard.
const KPI_META: Array<{ key: keyof DashboardStats['totals']; label: string }> = [
  { key: 'projects', label: 'Projects' },
  { key: 'services', label: 'Services' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'techStacks', label: 'Tech Stacks' },
  { key: 'inquiries', label: 'Inquiries' },
  { key: 'bookings', label: 'Bookings' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDashboardStats()
      .then((data) => active && setStats(data))
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load stats');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold uppercase tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Portfolio content &amp; engagement overview
        </p>
      </header>

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 px-4 py-3 font-mono text-xs text-[var(--destructive-foreground)]">
          {error}
        </div>
      )}

      {/* KPI row */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {KPI_META.map(({ key, label }) => (
          <div
            key={key}
            className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {label}
            </p>
            <p className="mt-2 font-['Space_Grotesk'] text-3xl font-bold tabular-nums">
              {loading ? (
                <span className="inline-block h-8 w-10 animate-pulse rounded bg-white/10" />
              ) : (
                stats?.totals[key] ?? 0
              )}
            </p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-5 lg:col-span-2">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            Inquiries — last months
          </h2>
          <div className="mt-4">
            {stats && stats.inquiriesByMonth.length > 0 ? (
              <TrendLine data={stats.inquiriesByMonth} />
            ) : (
              <EmptyChart loading={loading} />
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            Bookings by status
          </h2>
          <div className="mt-4">
            {stats && stats.bookingsByStatus.length > 0 ? (
              <Donut data={stats.bookingsByStatus} />
            ) : (
              <EmptyChart loading={loading} />
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            Projects by category
          </h2>
          <div className="mt-4">
            {stats && stats.projectsByCategory.length > 0 ? (
              <BarList data={stats.projectsByCategory} />
            ) : (
              <EmptyChart loading={loading} />
            )}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.02] p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            Recent inquiries
          </h2>
          <ul className="mt-4 divide-y divide-white/5">
            {loading && (
              <li className="py-3">
                <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10" />
              </li>
            )}
            {!loading && (!stats || stats.recentInquiries.length === 0) && (
              <li className="py-3 font-mono text-xs text-zinc-500">No inquiries yet.</li>
            )}
            {stats?.recentInquiries.map((item) => (
              <li key={item._id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{item.name || 'Anonymous'}</p>
                  <p className="truncate font-mono text-[11px] text-zinc-500">
                    {item.email || '—'}
                  </p>
                </div>
                {item.createdAt && (
                  <time className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </time>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

// Placeholder shown when a series has no data (or is still loading).
function EmptyChart({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-40 items-center justify-center font-mono text-xs text-zinc-600">
      {loading ? (
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : (
        'No data'
      )}
    </div>
  );
}
