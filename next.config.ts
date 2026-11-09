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
  // The three pages Snipcart used to validate prices went with Snipcart (2026-11-08); anyone holding one of
  // those links lands on the section that sells the thing instead of a 404.
  async redirects() {
    return [
      { source: '/products/all-products', destination: '/#be-mf', permanent: true },
      { source: '/products/pyro-board', destination: '/#pyro-skateshop', permanent: true },
      { source: '/products/pyro-shirt', destination: '/#pyro-skateshop', permanent: true },
    ];
  },
};

export default nextConfig;