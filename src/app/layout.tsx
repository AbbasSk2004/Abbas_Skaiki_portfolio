import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from './components/SiteChrome';
import { ContactFooterSection } from './components/ContactFooterSection';

// Global SEO via the Next.js Metadata API. Page-level files can extend/override
// individual fields (see works/[slug]/page.tsx for a dynamic example).
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'Abbas Skaiki-portfolio',
    template: '%s — Skaiki Development',
  },
  description:
    'Portfolio of a frontend engineer and UI designer. Precision execution, technical depth, and high-end digital aesthetics.',
  // Browser tab / bookmark icon. Mirrors the Vite <link rel="icon"> that pointed
  // at the logo in public/assets. Also used for the Apple touch icon.
  icons: {
    icon: 'https://res.cloudinary.com/duacqzjyv/image/upload/v1784727313/logo_ueoy5u.png',
    shortcut: 'https://res.cloudinary.com/duacqzjyv/image/upload/v1784727313/logo_ueoy5u.png',
    apple: 'https://res.cloudinary.com/duacqzjyv/image/upload/v1784727313/logo_ueoy5u.png',
  },
  openGraph: {
    type: 'website',
    title: 'Abbas — Frontend Engineer & UI Designer',
    description:
      'Precision execution, technical depth, and high-end digital aesthetics.',
    siteName: 'Abbas Portfolio',
  },
};

// The root layout stays intentionally bare: it owns only <html>/<body> and the
// global brand background. Whether the public chrome (GridBackground + Navbar +
// ContactFooter) renders is decided by <SiteChrome>, which strips it entirely
// from /admin routes — so the admin console shares no nav/footer DOM with the
// public site (fixes the layout bleed where the public navbar sat over the admin
// top bar). Admin routes get their own chrome from app/admin/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-[#050505]">
        <SiteChrome footer={<ContactFooterSection />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
