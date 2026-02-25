'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Analytics event types for tracking
 */
export type AnalyticsEvent =
  | 'page_view'
  | 'course_start'
  | 'course_complete'
  | 'lesson_start'
  | 'lesson_complete'
  | 'quiz_submit'
  | 'nft_mint'
  | 'ens_register'
  | 'wallet_connect'
  | 'sign_in'
  | 'sign_out'
  | 'error';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track analytics event
 * Sends to configured analytics provider (stub for now)
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
  }

  // Send to analytics provider
  // This is a stub that can be connected to:
  // - Google Analytics (gtag)
  // - Posthog
  // - Plausible
  // - Vercel Analytics
  // - Custom backend
  
  try {
    // Vercel Web Analytics (if enabled)
    if (typeof window !== 'undefined' && (window as unknown as { va?: (event: string, props?: unknown) => void }).va) {
      (window as unknown as { va: (event: string, props?: unknown) => void }).va(event, properties);
    }
    
    // Google Analytics (if enabled)
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event, properties);
    }
  } catch {
    // Silently fail analytics
  }
}

/**
 * Track page views automatically
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      trackEvent('page_view', {
        page: pathname,
        query: searchParams?.toString() || '',
      });
    }
  }, [pathname, searchParams]);
}

/**
 * Analytics provider component
 * Wraps the app to enable automatic page tracking
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}

/**
 * Helper hooks for common tracking scenarios
 */
export function useTrackCourse() {
  return {
    trackStart: (courseId: string, courseName: string) => {
      trackEvent('course_start', { courseId, courseName });
    },
    trackComplete: (courseId: string, courseName: string, score?: number) => {
      trackEvent('course_complete', { courseId, courseName, score });
    },
  };
}

export function useTrackLesson() {
  return {
    trackStart: (lessonId: string, lessonTitle: string, courseId: string) => {
      trackEvent('lesson_start', { lessonId, lessonTitle, courseId });
    },
    trackComplete: (lessonId: string, lessonTitle: string, courseId: string, score?: number) => {
      trackEvent('lesson_complete', { lessonId, lessonTitle, courseId, score });
    },
  };
}

export function useTrackBlockchain() {
  return {
    trackMint: (nftType: string, txHash?: string) => {
      trackEvent('nft_mint', { nftType, txHash });
    },
    trackENS: (ensName: string, txHash?: string) => {
      trackEvent('ens_register', { ensName, txHash });
    },
    trackWalletConnect: (walletType: string, address?: string) => {
      trackEvent('wallet_connect', { walletType, address: address?.slice(0, 10) });
    },
  };
}
