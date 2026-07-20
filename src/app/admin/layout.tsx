import type { Metadata } from 'next';
import { AdminShell } from './components/AdminShell';

// The admin area opts out of search indexing entirely — it's a private console.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

// Segment layout: wraps every /admin/* route in the auth guard + chrome.
// The guard itself (AdminShell) exempts /admin/login so the login page renders
// bare. This nests inside the root layout, so we deliberately avoid re-adding
// <html>/<body> here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
