import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  projects,
  getProjectBySlug,
  getNextProject,
} from '../../data/projects';
import { ProjectDetails } from './ProjectDetails';

// Pre-render every project page at build time. Replaces the client-side
// react-router :slug resolution with static generation.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

// Per-project SEO. Runs on the server; unknown slugs get a generic title since
// the page itself redirects them away.
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return { title: 'Project not found' };
  }
  return {
    title: project.title,
    description: project.challenge,
    openGraph: {
      title: project.title,
      description: project.challenge,
      images: [{ url: project.image }],
    },
  };
}

// Case-study route. Resolves the project from the URL param against the shared
// data module — this page and the listing surfaces never drift. Unknown slugs
// are redirected back to the works index (the old <Navigate to="/works" />).
// Navbar and the site-wide ContactFooter come from the shared layout.
export default function ProjectDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    redirect('/works');
  }

  const nextProject = getNextProject(project.slug);

  return <ProjectDetails project={project} nextProject={nextProject} />;
}
