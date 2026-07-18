import { HeroSection } from './components/HeroSection';
import { InfoStrip } from './components/InfoStrip';
import { TextAboutSection } from './components/TextAboutSection';
import { DrivenResultsSection } from './components/DrivenResultsSection';
import { ExpertiseSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ApproachSection } from './components/ApproachSection';
import { SelectedWorksSection } from './components/SelectedWorksSection';
import { TestimonialsSection } from './components/TestimonialsSection';

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
