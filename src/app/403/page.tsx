import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldOff className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-white mb-3">403</h1>
        <h2 className="text-xl font-semibold text-slate-300 mb-4">Access Forbidden</h2>
        <p className="text-slate-400 mb-8">
          You don&apos;t have permission to access this page. If you think this is a mistake,
          contact an administrator.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-sm hover:from-cyan-700 hover:to-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/5 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
