'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Clock, FileCheck, FilePlus, GraduationCap, Loader2, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface CourseOverview {
  id: string;
  title: string;
  slug: string;
  status: string;
  level: string;
  _count: { lessons: number; users: number; sections: number };
  rejectionReason?: string | null;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<CourseOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/instructor/courses')
      .then(r => r.json())
      .then(data => setCourses(data.courses ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const drafts = courses.filter(c => c.status === 'DRAFT');
  const awaiting = courses.filter(c => c.status === 'AWAITING_APPROVAL');
  const published = courses.filter(c => c.status === 'PUBLISHED');
  const rejected = courses.filter(c => c.status === 'REJECTED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-400/20">Draft</Badge>;
      case 'AWAITING_APPROVAL': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20">Awaiting Approval</Badge>;
      case 'PUBLISHED': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-400/20">Published</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-400/20">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-emerald-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Instructor Dashboard
          </h1>
        </div>
        <p className="text-slate-400">Create and manage your courses. Submitted courses need admin approval before publishing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-sm font-medium">Drafts</p>
                <p className="text-2xl font-bold text-white">{drafts.length}</p>
              </div>
              <FilePlus className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Awaiting Review</p>
                <p className="text-2xl font-bold text-white">{awaiting.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-sm font-medium">Published</p>
                <p className="text-2xl font-bold text-white">{published.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold text-white">
                  {courses.reduce((s, c) => s + c._count.users, 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejected courses alert */}
      {rejected.length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20 mb-8">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Courses Needing Revision ({rejected.length})
            </CardTitle>
            <CardDescription className="text-red-300/70">
              These courses were reviewed and need changes before resubmission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rejected.map(course => (
              <div key={course.id} className="p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{course.title}</span>
                  <Button asChild size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Link href={`/instructor/courses/${course.id}`}>Edit & Resubmit</Link>
                  </Button>
                </div>
                {course.rejectionReason && (
                  <p className="text-sm text-red-300/80 bg-red-500/10 rounded p-2">
                    Reason: {course.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FilePlus className="h-5 w-5 text-emerald-400" />
              Create a Course
            </CardTitle>
            <CardDescription>
              Start building a new course with sections, lessons, and rich content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-none">
              <Link href="/instructor/courses/new">
                <FilePlus className="h-4 w-4 mr-2" />
                New Course
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-400" />
              Manage Courses
            </CardTitle>
            <CardDescription>
              View and edit all your courses, add lessons and content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 border-none">
              <Link href="/instructor/courses">
                <BookOpen className="h-4 w-4 mr-2" />
                My Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
