/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle better-sqlite3 native module
    if (isServer) {
      config.externals.push('better-sqlite3');
    }

    // Disable webpack cache to avoid issues with SQLite
    config.cache = false;

    return config;
  },

  // Enable experimental features if needed
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'winston'],
  },

  // Disable image optimization for development
  images: {
    unoptimized: true,
  },

  // Allow serving static files
  async rewrites() {
    return [
      {
        source: '/models/:path*',
        destination: '/models/:path*',
      },
    ];
  },
};

export default nextConfig;
