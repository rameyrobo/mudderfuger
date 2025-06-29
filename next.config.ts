// next.config.js or next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mudderfuger.b-cdn.net',
        // pathname: '/_imgs/**' // (optional, you can be strict here)
      },
    ],
  },
};

export default nextConfig;