import { getAbout } from '@/api/public/about';
import { AboutText } from './AboutText';

// Server Component: fetches the singleton About document from the Express API
// (1-hour ISR via getAbout) and passes the bio + portrait to the client
// presentation, where the scroll-linked word-reveal animation lives. Splitting
// this way keeps `revalidate` working while preserving the client-only motion.
export const TextAboutSection: React.FC = async () => {
  const about = await getAbout();

  return (
    <AboutText
      bio={about.bio}
      portrait={about.aboutImage ?? '/assets/abbas.png'}
    />
  );
};
