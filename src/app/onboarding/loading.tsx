import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="bg-slate-900/80 border-slate-700 max-w-2xl w-full">
        <CardContent className="p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 w-3 bg-slate-700 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full">
              <div className="h-1 w-1/4 bg-slate-700 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="h-8 w-64 bg-slate-800 rounded-lg animate-pulse mb-4 mx-auto" />
          <div className="h-5 w-80 bg-slate-800/60 rounded animate-pulse mb-8 mx-auto" />

          {/* Form fields */}
          <div className="space-y-6">
            <div>
              <div className="h-4 w-24 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-12 w-full bg-slate-800 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-28 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="h-12 w-full bg-slate-700 rounded-lg animate-pulse mt-8" />
        </CardContent>
      </Card>
    </div>
  );
}
