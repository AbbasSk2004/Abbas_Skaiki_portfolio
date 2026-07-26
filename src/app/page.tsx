import { HeroSection } from './components/home/server/HeroSection';
import { InfoStrip } from './components/home/server/InfoStrip';
import { TextAboutSection } from './components/home/server/TextAboutSection';
import { DrivenResultsSection } from './components/home/server/DrivenResultsSection';
import { ExpertiseSection } from './components/home/server/AboutSection';
import { ServicesSection } from './components/home/server/ServicesSection';
import { ApproachSection } from './components/home/server/ApproachSection';
import { SelectedWorksSection } from './components/home/server/SelectedWorksSection';
import { TestimonialsSection } from './components/home/server/TestimonialsSection';

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
