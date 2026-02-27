import { Card, CardContent } from '@/components/ui/card';

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="h-10 w-56 bg-muted rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-5 w-72 bg-muted/60 rounded animate-pulse mx-auto" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
