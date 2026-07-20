'use client';

// -----------------------------------------------------------------------------
// Hand-rolled analytics primitives — no charting dependency.
//
// Every color comes from the design tokens already defined in theme.css
// (--chart-1 … --chart-5) so these panels are a native extension of the brand
// palette, not a themed third-party widget. Each chart is a plain inline <svg>
// (or CSS bars) that scales to its container. Motion mirrors the rest of the
// site (motion/react) with short easeOut reveals.
//
// Kept deliberately small and prop-driven so the same three primitives cover
// every model's analytics as the dashboard grows.
// -----------------------------------------------------------------------------

import { motion } from 'motion/react';
import { cn } from '@/app/lib/cn';
import type { StatPoint } from '@/api/admin/stats';

// The five brand chart tokens, referenced by CSS var so light/dark both work.
const CHART_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const;

const tokenAt = (i: number) => CHART_VARS[i % CHART_VARS.length];

// --- Shared panel chrome ------------------------------------------------------

export function ChartPanel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-white/10 bg-white/[0.02] p-5',
        'backdrop-blur-sm',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="font-['Space_Grotesk'] text-sm font-semibold uppercase tracking-widest text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 font-mono text-[11px] text-zinc-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// --- KPI stat card ------------------------------------------------------------

export function StatCard({
  label,
  value,
  accentIndex = 0,
  delay = 0,
}: {
  label: string;
  value: number;
  accentIndex?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className="relative overflow-hidden rounded-[var(--radius)] border border-white/10 bg-white/[0.02] p-5"
    >
      {/* Accent bar in the token color */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: tokenAt(accentIndex) }}
      />
      <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-white tabular-nums">
        {value.toLocaleString()}
      </p>
    </motion.div>
  );
}

// --- Horizontal bar list (e.g. projects by category) --------------------------

export function BarList({ data }: { data: StatPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <EmptyState />;

  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
            <span className="truncate text-zinc-400">{d.label}</span>
            <span className="tabular-nums text-zinc-300">{d.value}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.06 }}
              className="h-full rounded-full"
              style={{ background: tokenAt(i) }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// --- Donut (e.g. bookings by status) ------------------------------------------

export function Donut({ data, size = 160 }: { data: StatPoint[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total) return <EmptyState />;

  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAccum = 0;
  const segments = data.map((d, i) => {
    const fraction = d.value / total;
    const dash = fraction * circumference;
    const seg = {
      color: tokenAt(i),
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offsetAccum,
      label: d.label,
      value: d.value,
    };
    offsetAccum += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((s, i) => (
          <motion.circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={s.dashArray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: s.dashOffset }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.08 }}
          />
        ))}
        {/* Center hole label */}
      </svg>
      <ul className="space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 font-mono text-[11px]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="text-zinc-400">{s.label}</span>
            <span className="tabular-nums text-zinc-300">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Sparkline / trend line (e.g. inquiries by month) -------------------------

export function TrendLine({
  data,
  height = 120,
}: {
  data: StatPoint[];
  height?: number;
}) {
  if (data.length < 2) return <EmptyState />;

  const width = 320;
  const pad = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = height - pad - (d.value / max) * (height - pad * 2);
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // Area fill path — close down to the baseline.
  const areaPath =
    `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - pad} ` +
    `L ${points[0].x.toFixed(1)} ${height - pad} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill="url(#trendFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="var(--chart-1)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--chart-1)" />
      ))}
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex h-24 items-center justify-center font-mono text-[11px] text-zinc-600">
      No data yet
    </div>
  );
}
