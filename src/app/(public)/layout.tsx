import { ReactNode } from "react";
import Navbar from "./_components/navbar";

export default function LayoutPublic({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-[#093a3e] dark:text-[#f8f6f2]">
      <main>{children}</main>
    </div>
  );
}
