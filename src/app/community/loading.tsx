import { Card, CardContent } from '@/components/ui/card';

export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-12 text-center">
          <div className="h-12 w-64 bg-slate-800 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-6 w-96 bg-slate-800/60 rounded animate-pulse mx-auto" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="h-10 w-16 bg-slate-700 rounded animate-pulse mx-auto mb-2" />
                <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-slate-700 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 w-40 bg-slate-700 rounded animate-pulse mb-2" />
                      <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse mb-1" />
                      <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-6">
                <div className="h-6 w-32 bg-slate-700 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-slate-700 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
