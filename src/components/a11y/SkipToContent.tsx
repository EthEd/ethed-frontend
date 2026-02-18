'use client';

/**
 * Skip to main content link for accessibility
 * Allows keyboard users to bypass navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      Skip to main content
    </a>
  );
}

/**
 * Main content wrapper with ID for skip link target
 */
export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      {children}
    </main>
  );
}
