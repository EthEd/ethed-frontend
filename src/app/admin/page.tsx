'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Mock admin stats
  const adminStats = {
    totalUsers: 1247,
    activeCourses: 3,
    nftsMinted: 892,
    completionRate: 78
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-300">
            Manage eth.ed platform, courses, and user analytics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-white">{adminStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Active Courses</p>
                  <p className="text-2xl font-bold text-white">{adminStats.activeCourses}</p>
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
                  <p className="text-2xl font-bold text-white">{adminStats.nftsMinted.toLocaleString()}</p>
                </div>
                <Award className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{adminStats.completionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Management */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                Course Management
              </CardTitle>
              <CardDescription>Manage courses, lessons, and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-none">
                <Link href="/admin/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Courses
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  Add Course
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  Edit Content
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                User Management
              </CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none">
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  View Users
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  User Analytics
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  Permissions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                System Settings
              </CardTitle>
              <CardDescription>Platform configuration and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>Platform metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  User Activity
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                  Course Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription>Latest platform events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300">New user registered: demo@ethed.app</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-white/10 text-slate-400">2 min ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-300">Course completed: EIPs 101</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-white/10 text-slate-400">5 min ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-slate-300">NFT minted: Genesis Scholar</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-white/10 text-slate-400">8 min ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}