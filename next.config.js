const onVercel = Boolean(process.env.VERCEL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  ...(onVercel ? {} : { output: 'standalone' }),
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
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
