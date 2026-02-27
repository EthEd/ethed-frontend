import { Card, CardContent } from '@/components/ui/card';

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8 text-center">
          <div className="h-10 w-48 bg-muted rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-5 w-80 bg-muted/60 rounded animate-pulse mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted/60 rounded animate-pulse" />
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
