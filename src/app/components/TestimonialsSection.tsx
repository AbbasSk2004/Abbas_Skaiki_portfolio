import { getTestimonials, type ApiTestimonial } from '@/api/public/testimonials';
import { TestimonialsCarousel, type TestimonialItem } from './TestimonialsCarousel';

// Server Component: fetches testimonials from the Express API (1-hour ISR via
// getTestimonials) and hands plain data to the client carousel, where the
// prev/next state lives. Splitting this way keeps `revalidate` working while
// preserving the client-only carousel interactivity.
//
// Defensive: testimonials are non-critical social proof, not page scaffolding.
// If the API is down or returns 5xx (apiGet throws ApiError), we log and render
// nothing rather than crash the whole landing page — same pattern as
// ContactFooterSection. The section self-heals within seconds of an admin
// creating the first testimonial: the backend pings /api/revalidate on every
// successful write (routes/admin/index.js), dropping the ISR cache.
export const TestimonialsSection: React.FC = async () => {
  let apiTestimonials: ApiTestimonial[] = [];
  try {
    apiTestimonials = await getTestimonials();
  } catch (err) {
    console.error('[testimonials] Failed to load testimonials; hiding section:', err);
    return null;
  }

  // Map API documents onto the carousel shape. `clientName` -> author; `role`
  // and `company` combine into the sub-line the design shows (e.g.
  // "DIRECTOR, AESTHA STUDIO"); `feedback` -> quote.
  const testimonials: TestimonialItem[] = apiTestimonials.map((t) => ({
    id: t._id,
    quote: t.feedback,
    author: t.clientName,
    title: [t.role, t.company].filter(Boolean).join(', '),
    avatar: t.avatar ?? '',
  }));

  // Nothing seeded / all deleted: render nothing rather than crash the carousel
  // on an undefined active item.
  if (testimonials.length === 0) return null;

  return <TestimonialsCarousel testimonials={testimonials} />;
}
