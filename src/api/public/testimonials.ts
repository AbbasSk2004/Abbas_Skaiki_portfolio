import { apiGet } from '../api';

// Mirrors the Testimonial documents served by the Express backend
// (see back/models/Testimonial.js).
export type ApiTestimonial = {
  _id: string;
  clientName: string;
  role?: string;
  company?: string;
  feedback: string;
  avatar?: string;
};

// GET /api/testimonials — all testimonials (served by testimonialRoutes).
export const getTestimonials = () =>
  apiGet<ApiTestimonial[]>('/api/testimonials', { next: { revalidate: 3600 } });
