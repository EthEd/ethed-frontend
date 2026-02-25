'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/80 border-slate-700 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-400 mb-6">
            We encountered an error loading your dashboard. This has been logged and we&apos;re working on it.
          </p>
          
          {error.digest && (
            <p className="text-xs text-slate-500 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
