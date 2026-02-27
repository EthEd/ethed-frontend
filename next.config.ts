import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },

  async redirects() {
    return [
      { source: '/courses', destination: '/learn', permanent: true },
      { source: '/courses/:path*', destination: '/learn/:path*', permanent: true },
    ];
  },

  async headers() {
    if (process.env.NODE_ENV === 'production') return [];

    const reportOnlyPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' ws: wss: https:",
      "font-src 'self' data: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "report-uri /api/csp-report"
    ].join('; ');

    return [
      {
        source: '/((?!api).*)', // Apply to all routes EXCEPT /api
        headers: [
          {
            key: 'Content-Security-Policy-Report-Only',
            value: reportOnlyPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
