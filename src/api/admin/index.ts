// -----------------------------------------------------------------------------
// Admin API barrel.
//
// Every admin sub-service (auth, projects, stats, …) is re-exported here under a
// namespace so the centralized src/api/api.ts can pull the whole admin surface
// in with a single modular import:  import { admin } from '@/api/api'.
//
// As each model slice is built, add one export line below — mirroring the
// per-model routers under back/routes/admin/.
// -----------------------------------------------------------------------------

export * as adminAuth from './auth';
export * as adminProjects from './projects';
export * as adminServices from './services';
export * as adminTestimonials from './testimonials';
export * as adminTechStacks from './techStack';
export * as adminApproaches from './approach';
export * as adminDrivenResults from './drivenResults';
export * as adminSocialLinks from './socialLinks';
export * as adminAbout from './about';
export * as adminHero from './hero';
export * as adminContact from './contact';
export * as adminInquiries from './inquiries';
export * as adminBookings from './bookings';
export * as adminStats from './stats';

// Shared low-level client, exposed for any bespoke admin call not yet wrapped in
// a dedicated service.
export { adminFetch, adminGet, adminPost, adminPut, adminDelete } from './client';
