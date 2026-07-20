'use client';

// -----------------------------------------------------------------------------
// Admin route guard + shell.
//
// Wraps every /admin/* page except /admin/login. On mount it calls getMe()
// (GET /api/auth/me with the cookie) — if that 401s, the user is bounced to the
// login page. While the check is in flight we show a minimal loader so no
// private chrome flashes before auth resolves.
//
// The chrome (sidebar + top bar) reuses the exact site palette: #050505 base,
// white/10 borders, Space Grotesk / mono type — so the dashboard reads as the
// same product as the public portfolio.
//
// RESPONSIVE NAV:
//   - md+ : fixed vertical sidebar (unchanged).
//   - <md : a sticky top header with a Menu/X toggle opens a fade-in overlay +
//           slide-out drawer carrying the SAME grouped nav. One <NavLinks/>
//           renders in both places, so the two never drift apart.
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { getMe, logout, type AdminUser } from '@/api/admin/auth';
import { cn } from '@/app/lib/cn';

// Grouped nav. Each section maps 1:1 to an admin router under back/routes/admin/.
const NAV: Array<{ group: string; items: Array<{ href: string; label: string }> }> = [
  {
    group: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard' }],
  },
  {
    group: 'Content',
    items: [
      { href: '/admin/hero', label: 'Hero' },
      { href: '/admin/about', label: 'About' },
      { href: '/admin/projects', label: 'Projects' },
      { href: '/admin/services', label: 'Services' },
      { href: '/admin/approaches', label: 'Approach' },
      { href: '/admin/driven-results', label: 'Results' },
      { href: '/admin/tech-stacks', label: 'Tech Stacks' },
      { href: '/admin/testimonials', label: 'Testimonials' },
    ],
  },
  {
    group: 'Contact',
    items: [
      { href: '/admin/contact', label: 'Contact Info' },
      { href: '/admin/social-links', label: 'Social Links' },
    ],
  },
  {
    group: 'Inbox',
    items: [
      { href: '/admin/inquiries', label: 'Inquiries' },
      { href: '/admin/bookings', label: 'Bookings' },
    ],
  },
];

// Shared nav body — rendered inside both the desktop sidebar and the mobile
// drawer so the grouping, typography, and active states are defined ONCE.
// `onNavigate` lets the drawer close itself when a link is tapped.
function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((section) => (
        <div key={section.group} className="space-y-1">
          <p className="px-3 pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            {section.group}
          </p>
          {section.items.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'block rounded-[var(--radius-md)] px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors',
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  // Mobile drawer open/closed. Desktop ignores this entirely (sidebar is static).
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // The login page renders without a guard.
    if (isLogin) {
      setChecking(false);
      return;
    }
    let active = true;
    getMe()
      .then((user) => {
        if (active) setAdmin(user);
      })
      .catch(() => {
        if (active) router.replace('/admin/login');
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [isLogin, router]);

  // Close the drawer on any route change so a tapped link never leaves it open.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (isLogin) return <>{children}</>;

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  // Guard failed and redirect is in flight — render nothing to avoid a flash.
  if (!admin) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/admin/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Desktop sidebar — md+ only, unchanged. */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <img src="/assets/logo.png" alt="" className="h-8 w-8 object-contain" />
          <span className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          <NavLinks pathname={pathname} />
        </nav>
      </aside>

      {/* Mobile drawer + backdrop — <md only. */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-white/10 bg-[#050505] md:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                <div className="flex items-center gap-3">
                  <img src="/assets/logo.png" alt="" className="h-7 w-7 object-contain" />
                  <span className="font-['Space_Grotesk'] text-sm font-bold uppercase tracking-widest">
                    Admin
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex-1 space-y-5 overflow-y-auto p-4">
                <NavLinks pathname={pathname} onNavigate={() => setIsOpen(false)} />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#050505]/90 px-4 backdrop-blur md:h-20 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Hamburger — mobile only. */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(true)}
              className="-ml-1 text-zinc-300 transition-colors hover:text-white md:hidden"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <p className="truncate font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              Signed in as <span className="text-white">{admin.username}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-[var(--radius-md)] border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/30 hover:text-white md:px-4"
          >
            Log out
          </button>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex-1 overflow-y-auto p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
