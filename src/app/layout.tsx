import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteChrome } from './components/layout/SiteChrome';
import { ContactFooterSection } from './components/layout/ContactFooterSection';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const logoUrl =
  'https://res.cloudinary.com/duacqzjyv/image/upload/v1784727313/logo_ueoy5u.png';
const socialImageUrl =
  'https://res.cloudinary.com/duacqzjyv/image/upload/c_pad,b_rgb:050505,h_630,w_1200/q_auto/v1784727313/logo_ueoy5u.png';
const siteDescription =
  'Abbas Skaiki - Full Stack Developer crafting high-end web applications with precision, technical depth, and thoughtful digital experiences.';

// Global SEO via the Next.js Metadata API. Page-level files can extend/override
// individual fields (see works/[slug]/page.tsx for a dynamic example).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Abbas Skaiki',
  title: {
    default: 'Abbas Skaiki | Full Stack Developer',
    template: '%s | Abbas Skaiki',
  },
  description: siteDescription,
  authors: [{ name: 'Abbas Skaiki' }],
  creator: 'Abbas Skaiki',
  publisher: 'Abbas Skaiki',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Browser tab / bookmark icon. Mirrors the Vite <link rel="icon"> that pointed
  // at the logo in public/assets. Also used for the Apple touch icon.
  icons: {
    icon: [{ url: logoUrl, type: 'image/png' }],
    shortcut: [{ url: logoUrl, type: 'image/png' }],
    apple: [{ url: logoUrl, type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Abbas Skaiki | Full Stack Developer',
    description: siteDescription,
    siteName: 'Abbas Skaiki',
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'Abbas Skaiki - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abbas Skaiki | Full Stack Developer',
    description: siteDescription,
    images: [socialImageUrl],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
  themeColor: '#050505',
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
