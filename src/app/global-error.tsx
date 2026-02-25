'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/monitoring';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('Global error', 'global-error', undefined, error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/90 backdrop-blur-xl border border-red-400/20 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">Application Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-400">
              Something went wrong with the application. Please try refreshing the page.
            </p>

            <div className="space-y-2">
              <Button
                onClick={reset}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>

              <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Error ID: {error.digest || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>
      </body>
    </html>
  );
}