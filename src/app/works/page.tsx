import { getProjects } from '@/api/public/projects';
import { mapApiProject, sortByIndex } from './projectLayout';
import { WorksList } from './WorksList';

// Server Component: fetches projects from the Express API (1-hour ISR — see
// getProjects), merges each with its frontend layout hint, and hands the plain
// data to the client presentation component. All framer-motion interactivity
// lives in WorksList; this shell stays a server component so `revalidate` works.
export default async function WorksPage() {
  const apiProjects = await getProjects();
  const projects = sortByIndex(apiProjects.map(mapApiProject));

  return <WorksList projects={projects} />;
}
