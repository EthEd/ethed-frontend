import { Card, CardContent } from '@/components/ui/card';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-950 relative">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-72 bg-slate-800/60 rounded animate-pulse" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="h-4 w-20 bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-0">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
            {/* Table rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
              <div key={row} className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800">
                {[1, 2, 3, 4, 5].map((col) => (
                  <div key={col} className="h-4 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
