import { Card, CardContent } from '@/components/ui/card';

export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="absolute inset-0 z-0">
        <div className="from-cyan-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-12 text-center">
          <div className="h-12 w-80 bg-slate-800 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-6 w-96 bg-slate-800/60 rounded animate-pulse mx-auto" />
        </div>

        {/* Filter bar skeleton */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-slate-800 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Course grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700 rounded-2xl overflow-hidden">
              {/* Image placeholder */}
              <div className="h-48 bg-slate-800 animate-pulse" />
              <CardContent className="p-6">
                {/* Badge */}
                <div className="h-6 w-20 bg-slate-700 rounded-full animate-pulse mb-3" />
                {/* Title */}
                <div className="h-6 w-full bg-slate-700 rounded animate-pulse mb-2" />
                {/* Description */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                </div>
                {/* Meta info */}
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
