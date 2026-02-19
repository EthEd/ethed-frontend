import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security middleware for the EthEd platform
 * Adds security headers and handles route protection
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  const headers = response.headers;
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Content Security Policy
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob: *.pinata.cloud *.googleusercontent.com *.githubusercontent.com",
    "font-src 'self' data: https: fonts.gstatic.com",
    "connect-src 'self' https://*.infura.io https://*.alchemy.com wss://*.walletconnect.com https://*.walletconnect.com https://api.pinata.cloud https://*.polygon.technology https://*.supabase.co",
    "frame-src 'self' https://*.walletconnect.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
  
  if (!isApiRoute) {
    headers.set('Content-Security-Policy', csp);
  }
  
  // Prevent caching of sensitive pages
  const pathname = request.nextUrl.pathname;
  const noCacheRoutes = ['/dashboard', '/admin', '/profile', '/onboarding'];
  if (noCacheRoutes.some(route => pathname.startsWith(route))) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
