'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Users, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ModeratorDashboard() {
  const { data: session } = useSession();
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/moderator/users?page=1')
      .then(r => r.json())
      .then(d => setUserCount(d.total ?? null))
      .catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Moderator Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          Welcome back, {session?.user?.name ?? 'Moderator'}. You can manage users and handle ban actions from here.
        </p>
      </div>

      {/* Capabilities summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{userCount?.toLocaleString() ?? '…'}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-indigo-400 shrink-0" />
              <div>
                <p className="text-indigo-300 text-sm font-medium">Your Permissions</p>
                <ul className="text-slate-400 text-xs mt-1 space-y-0.5">
                  <li>✅ View all users</li>
                  <li>✅ Ban / unban regular users</li>
                  <li>🚫 Cannot change user roles</li>
                  <li>🚫 Cannot manage admins / mods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              User Management
            </CardTitle>
            <CardDescription>View users, ban or unban accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none">
              <Link href="/moderator/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
