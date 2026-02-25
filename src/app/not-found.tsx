import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 max-w-md w-full text-center">
        <CardHeader className="pb-6">
          <div className="text-6xl mb-4">🔍</div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-slate-300 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
              <Link href="/learn">
                <Search className="h-4 w-4 mr-2" />
                Browse Courses
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Need help? Check out our{' '}
              <Link href="/how-it-works" className="text-emerald-400 hover:text-emerald-300 underline">
                How It Works
              </Link>{' '}
              page or{' '}
              <Link href="/learn" className="text-emerald-400 hover:text-emerald-300 underline">
                start learning
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}