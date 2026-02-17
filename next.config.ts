import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   eslint: {
    ignoreDuringBuilds: true, // ✅ correct place
  },
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
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "report-uri /api/csp-report"
    ].join('; ');

    return [
      {
        source: '/(.*)',
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
