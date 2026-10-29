/** @type {import('next').NextConfig} */
const nextConfig = {
  // Drivers de banco rodam direto no Node, sem passar pelo bundler.
  serverExternalPackages: ['pg', '@electric-sql/pglite'],
};

export default nextConfig;
