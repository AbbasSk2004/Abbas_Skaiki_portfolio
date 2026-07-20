'use client';

// -----------------------------------------------------------------------------
// Site chrome boundary — fixes the admin/public layout bleed.
//
// The root layout (layout.tsx) is a Server Component and can't read the current
// path, so it previously hard-wrapped EVERY route — including /admin/* — in the
// public GridBackground > Navbar + ContactFooter chrome. That's what put the
// public nav on top of the admin top bar.
//
// This client boundary reads the pathname and, for any /admin route, renders
// ONLY {children} — the Navbar / GridBackground / ContactFooter are never
// mounted, so they are absent from the DOM (not merely hidden with CSS). The
// admin area supplies its own chrome via app/admin/layout.tsx → AdminShell.
//
// NOTE: this is the "conditional rendering in the root layout" approach. The
// equivalent (public) / (admin) route-group refactor achieves the same DOM
// result structurally; this variant avoids moving page files and keeps URLs
// identical.
// -----------------------------------------------------------------------------

import { usePathname } from 'next/navigation';
import { GridBackground } from './GridBackground';
import { Navbar } from './Navbar';
import { ContactFooterSection } from './ContactFooterSection';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Admin routes render bare — the admin segment layout provides its own shell.
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Public site: the shared GridBackground > Navbar + main + ContactFooter chrome.
  return (
    <GridBackground>
      <div className="relative w-full">
        <Navbar />
        <main className="relative w-full">{children}</main>
        <ContactFooterSection />
      </div>
    </GridBackground>
  );
}
