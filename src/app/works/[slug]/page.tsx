import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getProjects, getProjectBySlug } from '@/api/public/projects';
import { ApiError } from '@/api/api';
import { mapApiProject, sortByIndex } from '../projectLayout';
import { ProjectDetails } from './ProjectDetails';

const fallbackSocialImage =
  'https://res.cloudinary.com/duacqzjyv/image/upload/c_pad,b_rgb:050505,h_630,w_1200/q_auto/v1784727313/logo_ueoy5u.png';

// Pre-render every project page at build time from the API's slug list.
// (ISR still refreshes the data every hour via the per-request revalidate.)
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

// Per-project SEO. Runs on the server; unknown slugs get a generic title since
// the page itself redirects them away.
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const api = await getProjectBySlug(params.slug);
    const project = mapApiProject(api);
    const canonicalPath = `/works/${params.slug}`;
    const socialImage = project.image || fallbackSocialImage;
    return {
      title: project.title,
      description: project.challenge,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: canonicalPath,
        title: `${project.title} | Abbas Skaiki`,
        description: project.challenge,
        siteName: 'Abbas Skaiki',
        images: [{ url: socialImage, alt: project.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${project.title} | Abbas Skaiki`,
        description: project.challenge,
        images: [socialImage],
      },
    };
  } catch {
    return { title: 'Project not found' };
  }
}

// Case-study route. Resolves the project from the API by slug, merging layout
// hints. Unknown slugs (404 from the API) redirect back to the works index,
// preserving the original behavior. The "next project" is computed from the
// full sorted list so the footer CTA wraps in editorial order.
export default async function ProjectDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  let project;
  try {
    project = mapApiProject(await getProjectBySlug(params.slug));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      redirect('/works');
    }
    throw err; // real failure (API down, 500) — don't mask it as a 404
  }

  const all = sortByIndex((await getProjects()).map(mapApiProject));
  const i = all.findIndex((p) => p.slug === project.slug);
  const nextProject = all[(i + 1) % all.length];

  return <ProjectDetails project={project} nextProject={nextProject} />;
}
