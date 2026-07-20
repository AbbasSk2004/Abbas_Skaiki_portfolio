import { adminGet } from './client';

// -----------------------------------------------------------------------------
// Admin dashboard analytics service.
//
// Mirrors the aggregate payload from GET /api/admin/stats (see
// back/controllers/admin/statsController.js). These numbers drive the custom
// SVG/CSS analytics panels — we intentionally render charts by hand on the
// existing --chart-1..5 design tokens rather than pulling in a charting lib,
// keeping the Next.js front bundle as slim as it already is.
// -----------------------------------------------------------------------------

// A single labelled datum for a bar/line/donut series.
export interface StatPoint {
  label: string;
  value: number;
}

// The shape returned by the stats aggregator.
export interface DashboardStats {
  // Headline counters shown in the top KPI row.
  totals: {
    projects: number;
    services: number;
    testimonials: number;
    techStacks: number;
    inquiries: number;
    bookings: number;
  };
  // Inquiries grouped by month for the trend line (oldest → newest).
  inquiriesByMonth: StatPoint[];
  // Bookings grouped by status for the donut (e.g. pending / confirmed / done).
  bookingsByStatus: StatPoint[];
  // Projects grouped by category for the horizontal bars.
  projectsByCategory: StatPoint[];
  // Most recent inquiries for the activity feed.
  recentInquiries: Array<{
    _id: string;
    name?: string;
    email?: string;
    createdAt?: string;
  }>;
}

// GET /api/admin/stats — the whole dashboard payload in one authenticated call.
export const getDashboardStats = () => adminGet<DashboardStats>('/api/admin/stats');
