'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/monitoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Community page error', 'CommunityError', undefined, error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-card border-border max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Couldn&apos;t load community</h2>
          <p className="text-muted-foreground mb-6">
            We had trouble loading the community page. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
            <Button asChild>
              <Link href="/" className="gap-2">
                <Home className="w-4 h-4" /> Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
