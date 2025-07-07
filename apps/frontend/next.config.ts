import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api_be/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
  webpack(config: any) {
    config.module.rules.forEach((rule: any) => {
      if (rule.test && rule.test.toString().includes('css')) {
        rule.use.push({
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [['postcss-oklab-function', { preserve: true }]],
            },
          },
        });
      }
    });
    return config;
  },
};

export default nextConfig;
