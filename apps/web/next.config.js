const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Configurações de PWA
  headers: async () => {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // Configurações de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Otimizações de bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Code splitting para rotas pesadas
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        reports: {
          test: /[\\/]reports[\\/]/,
          name: 'reports',
          chunks: 'all',
          priority: 10,
        },
        automations: {
          test: /[\\/]automations[\\/]/,
          name: 'automations',
          chunks: 'all',
          priority: 10,
        },
        settings: {
          test: /[\\/]settings[\\/]/,
          name: 'settings',
          chunks: 'all',
          priority: 10,
        },
      };
    }
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
