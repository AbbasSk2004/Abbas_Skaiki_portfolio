import { getHero } from '@/api/public/hero';
import { HeroContent } from './HeroContent';

// Server Component: fetches the hero document from the Express API (1-hour ISR
// via getHero) and passes plain props to the client presentation, where the
// framer-motion entrance animations live. Splitting this way keeps `revalidate`
// working while preserving the client-only motion.
export const HeroSection: React.FC = async () => {
  const hero = await getHero();

  // The hero is a singleton; if it isn't seeded yet the section renders nothing
  // rather than crashing the whole page.
  if (!hero) return null;

  return (
    <HeroContent
      firstName={hero.firstName}
      lastName={hero.lastName}
      roleLabel={hero.roleLabel ?? ''}
      intro={hero.intro ?? ''}
      badge={hero.badge ?? ''}
      headerImage={hero.headerImage ?? '/assets/abbas.png'}
    />
  );
};
