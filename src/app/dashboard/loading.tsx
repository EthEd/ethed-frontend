import { Card, CardContent } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="absolute inset-0 z-0">
        <div className="from-cyan-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-12 w-96 bg-slate-800 rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-64 bg-slate-800/60 rounded animate-pulse" />
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
                  </div>
                  <div className="h-12 w-12 bg-slate-700 rounded-xl animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-700 rounded-xl">
                <CardContent className="p-6">
                  <div className="h-6 w-48 bg-slate-700 rounded animate-pulse mb-4" />
                  <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse mb-2" />
                  <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card className="bg-slate-900/50 border-slate-700 rounded-xl">
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-700 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
