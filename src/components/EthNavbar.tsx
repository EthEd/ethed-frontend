"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, LogIn } from "lucide-react";
import Image from "next/image";

// Import your actual Better Auth client
import { authClient } from "@/lib/auth-client";

// Use Better Auth's session hook
export default function Navbar() {
  // This hook gives session, loading state, errors, refetch
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = session?.user;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-emerald-400/20 bg-black/90 backdrop-blur-md shadow-lg">
      {/* Tagline */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 text-center font-mono font-semibold text-xs tracking-wide text-cyan-200 py-2 border-b border-emerald-400/20">
        Learn on-chain. Grow your chain of knowledge.
      </div>

      {/* Main Navbar */}
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left Menu */}
        <div className="flex space-x-6 font-medium text-sm text-slate-200">
          <Link href="#" className="hover:text-emerald-400 transition">Explore</Link>
          <Link href="#" className="hover:text-emerald-400 transition">How It Works</Link>
          <Link href="#" className="hover:text-emerald-400 transition">Milestones</Link>
        </div>

        {/* Center Logo */}
        <div>
          <img
            src="/logos/logo.png"
            alt="eth.ed Logo"
            height={32}
            width={128}
            className="h-8 mx-auto invert"
            loading="eager"
          />
        </div>

        {/* Right Menu */}
        <div className="flex space-x-6 font-medium text-sm items-center relative text-slate-200">
          <Link href="#" className="hover:text-emerald-400 transition">About</Link>
          <Link href="#" className="hover:text-emerald-400 transition">Start Learning</Link>

          {/* User/Login Section */}
          <div className="relative select-none">
            {isPending ? (
              <div className="flex items-center space-x-2 animate-pulse">
                <User className="h-5 w-5" />
                <span>Loading...</span>
              </div>
            ) : user ? (
              <div
                className="flex items-center space-x-2 cursor-pointer hover:text-emerald-400 transition"
                onClick={() => setDropdownOpen(v => !v)}
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Profile"}
                    width={28}
                    height={28}
                    className="rounded-full border border-cyan-400/60 shadow"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span>{user.name?.split(" ")[0] || "Profile"}</span>
              </div>
            ) : (
              <button
                // Use router to /login page for sign in (can be social/email)
                onClick={() => router.push("/login")}
                className="flex items-center space-x-2 px-3 py-1.5 border border-emerald-400/40 rounded-full hover:bg-emerald-400/10 hover:text-emerald-300 transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}

            {/* Dropdown - profile avatar menu */}
            {dropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-emerald-400/30 shadow-xl rounded-lg overflow-hidden z-50">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-400/10 bg-black/30">
                  <Image
                    src={user.image ?? "/avatar.svg"}
                    alt={user.name || "Profile"}
                    width={32}
                    height={32}
                    className="rounded-full border border-cyan-400/60"
                  />
                  <div>
                    <p className="font-semibold text-emerald-300 text-sm">{user.name}</p>
                    <p className="text-xs text-cyan-400">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          setDropdownOpen(false);
                          router.push("/login");
                        },
                      },
                    });
                  }}
                  className="w-full text-left px-4 py-2 flex items-center space-x-2 text-slate-200 hover:bg-emerald-400/10 hover:text-emerald-300 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
