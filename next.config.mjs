/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote hosts next/image is allowed to optimize. Unsplash serves the seed
    // placeholders; res.cloudinary.com serves every admin-uploaded asset (hero,
    // about, projects, services, approach, testimonials). Without the Cloudinary
    // entry, next/image throws "hostname is not configured" in production the
    // moment a real uploaded image is rendered.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // Scope to this project's asset tree so only our own uploads match.
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
