import type { Metadata } from 'next';
import { getProjects } from '@/api/public/projects';
import { mapApiProject, sortByIndex } from './projectLayout';
import { WorksList } from './WorksList';

const description =
  'Explore selected full stack web applications built by Abbas Skaiki, from polished interfaces to reliable backend systems.';
const socialImage =
  'https://res.cloudinary.com/duacqzjyv/image/upload/c_pad,b_rgb:050505,h_630,w_1200/q_auto/v1784727313/logo_ueoy5u.png';

export const metadata: Metadata = {
  title: 'Works',
  description,
  alternates: {
    canonical: '/works',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/works',
    title: 'Works | Abbas Skaiki',
    description,
    siteName: 'Abbas Skaiki',
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'Selected works by Abbas Skaiki',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Works | Abbas Skaiki',
    description,
    images: [socialImage],
  },
};

// Server Component: fetches projects from the Express API (1-hour ISR — see
// getProjects), merges each with its frontend layout hint, and hands the plain
// data to the client presentation component. All framer-motion interactivity
// lives in WorksList; this shell stays a server component so `revalidate` works.
export default async function WorksPage() {
  const apiProjects = await getProjects();
  const projects = sortByIndex(apiProjects.map(mapApiProject));

  return <WorksList projects={projects} />;
}
