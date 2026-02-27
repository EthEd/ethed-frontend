import { ReactNode } from "react";

export default function LayoutPublic({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      {children}
    </div>
  );
}
