import type { Metadata } from 'next';
import './globals.css';
import { GridBackground } from './components/GridBackground';
import { Navbar } from './components/Navbar';
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
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    type: 'website',
    title: 'Abbas — Frontend Engineer & UI Designer',
    description:
      'Precision execution, technical depth, and high-end digital aesthetics.',
    siteName: 'Abbas Portfolio',
  },
};

// The shared shell — formerly App.tsx's RootLayout. Every route renders inside
// the same GridBackground > Navbar + <main> + ContactFooter chrome, defined in
// exactly one place. The old react-router <Outlet /> is replaced by {children}.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full bg-[#050505]">
        <GridBackground>
          <div className="relative w-full">
            <Navbar />
            <main className="relative w-full">{children}</main>
            <ContactFooterSection />
          </div>
        </GridBackground>
      </body>
    </html>
  );
}
