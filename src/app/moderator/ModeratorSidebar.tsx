'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeft, ShieldCheck } from 'lucide-react';

const navItems = [
  { href: '/moderator', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/moderator/users', label: 'Users', icon: Users },
];

export function ModeratorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-slate-900/60 border-r border-white/10 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          <span className="font-bold text-white text-sm tracking-wide uppercase">Mod Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
