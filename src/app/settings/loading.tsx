export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="h-10 w-40 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-6 space-y-4">
              <div className="h-5 w-36 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted/60 rounded animate-pulse" />
              <div className="h-10 w-full bg-muted/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
