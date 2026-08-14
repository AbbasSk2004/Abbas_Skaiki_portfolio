import type { Metadata } from 'next';
import { HeroSection } from './components/home/server/HeroSection';
import { InfoStrip } from './components/home/server/InfoStrip';
import { TextAboutSection } from './components/home/server/TextAboutSection';
import { DrivenResultsSection } from './components/home/server/DrivenResultsSection';
import { ExpertiseSection } from './components/home/server/AboutSection';
import { ServicesSection } from './components/home/server/ServicesSection';
import { ApproachSection } from './components/home/server/ApproachSection';
import { SelectedWorksSection } from './components/home/server/SelectedWorksSection';
import { TestimonialsSection } from './components/home/server/TestimonialsSection';

const description =
  'Abbas Skaiki - Full Stack Developer crafting high-end web applications with precision, technical depth, and thoughtful digital experiences.';
const socialImage =
  'https://res.cloudinary.com/duacqzjyv/image/upload/c_pad,b_rgb:050505,h_630,w_1200/q_auto/v1784727313/logo_ueoy5u.png';

export const metadata: Metadata = {
  title: 'Home',
  description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Abbas Skaiki | Full Stack Developer',
    description,
    siteName: 'Abbas Skaiki',
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'Abbas Skaiki - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abbas Skaiki | Full Stack Developer',
    description,
    images: [socialImage],
  },
};

// The landing page: composes every home section in order. Navbar and the
// site-wide ContactFooter are provided by the shared layout (layout.tsx).
// This file itself holds no interactivity, so it stays a Server Component;
// individual sections opt into "use client" as their animations require.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <InfoStrip />
      <TextAboutSection />
      <DrivenResultsSection />
      <ExpertiseSection />
      <ServicesSection />
      <ApproachSection />
      <SelectedWorksSection />
      <TestimonialsSection />
    </>
  );
}
