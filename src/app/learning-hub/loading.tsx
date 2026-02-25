import { Card, CardContent } from '@/components/ui/card';

export default function LearningHubLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-12 text-center">
          <div className="h-12 w-72 bg-slate-800 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-6 w-80 bg-slate-800/60 rounded animate-pulse mx-auto" />
        </div>

        {/* Search bar skeleton */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Categories skeleton */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-28 bg-slate-800 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700 rounded-xl">
              <CardContent className="p-6">
                <div className="h-32 bg-slate-800 rounded-lg animate-pulse mb-4" />
                <div className="h-5 w-3/4 bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse mb-1" />
                <div className="h-4 w-2/3 bg-slate-700/50 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
