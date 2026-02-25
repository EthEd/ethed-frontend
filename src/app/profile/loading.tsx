import { Card, CardContent } from '@/components/ui/card';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        {/* Profile header skeleton */}
        <Card className="bg-slate-900/50 border-slate-700 rounded-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="h-32 w-32 bg-slate-700 rounded-full animate-pulse" />
              
              <div className="flex-1 text-center md:text-left">
                {/* Name */}
                <div className="h-8 w-48 bg-slate-700 rounded-lg animate-pulse mb-3 mx-auto md:mx-0" />
                {/* ENS */}
                <div className="h-5 w-32 bg-slate-700/60 rounded animate-pulse mb-4 mx-auto md:mx-0" />
                {/* Bio */}
                <div className="space-y-2">
                  <div className="h-4 w-full max-w-md bg-slate-700/50 rounded animate-pulse" />
                  <div className="h-4 w-3/4 max-w-md bg-slate-700/50 rounded animate-pulse" />
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-12 bg-slate-700 rounded animate-pulse mb-1 mx-auto" />
                    <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700 rounded-xl">
              <CardContent className="p-4">
                <div className="aspect-square bg-slate-800 rounded-lg animate-pulse mb-4" />
                <div className="h-5 w-3/4 bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-slate-700/50 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
