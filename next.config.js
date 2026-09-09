const onVercel = Boolean(process.env.VERCEL);
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(onVercel || onRailway ? {} : { output: 'standalone' }),
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
  },
  outputFileTracingIncludes: {
    '/api/templates': ['./seed/**/*'],
    '/api/templates/[id]': ['./seed/**/*'],
    '/api/v1/templates': ['./seed/**/*'],
    '/api/health': ['./seed/templates.json'],
  },
  env: onVercel
    ? {}
    : {
        NEXT_PUBLIC_PROJECT_ROOT: process.cwd(),
      },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
