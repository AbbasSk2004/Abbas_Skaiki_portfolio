/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Project cover/gallery images are served from Unsplash. Allow that remote
    // host so next/image can optimize them. Add more hosts here as needed.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
