'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Settings,
  Database,
  Shield,
  Activity,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  activeCourses: number;
  nftsMinted: number;
  completionRate: number;
  totalEnrollments: number;
  moderatorCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-red-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-slate-400">Manage the eth.ed platform, users, courses, and audit logs.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers.toLocaleString() ?? '—'}</p>
                <p className="text-xs text-slate-500 mt-1">{stats?.moderatorCount ?? 0} moderators</p>
              </div>
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Published Courses</p>
                <p className="text-2xl font-bold text-white">{stats?.activeCourses ?? '—'}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm font-medium">NFTs Minted</p>
                <p className="text-2xl font-bold text-white">{stats?.nftsMinted.toLocaleString() ?? '—'}</p>
              </div>
              <Award className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-sm font-medium">Total Enrollments</p>
                <p className="text-2xl font-bold text-white">{stats?.totalEnrollments.toLocaleString() ?? '—'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300 text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{stats?.completionRate ?? '—'}%</p>
              </div>
              <Activity className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              User Management
            </CardTitle>
            <CardDescription>Manage roles, ban users, and review accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-none">
              <Link href="/admin/users"><Users className="h-4 w-4 mr-2" />Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              Course Management
            </CardTitle>
            <CardDescription>Manage courses, lessons, and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none">
              <Link href="/admin/courses"><BookOpen className="h-4 w-4 mr-2" />Manage Courses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-orange-400" />
              Audit Logs
            </CardTitle>
            <CardDescription>Track all admin and moderator actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-none">
              <Link href="/admin/audit-logs"><ClipboardList className="h-4 w-4 mr-2" />View Audit Logs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              System
            </CardTitle>
            <CardDescription>Platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
              <Database className="h-4 w-4 mr-2" />Database
            </Button>
            <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
              <Shield className="h-4 w-4 mr-2" />Security
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
