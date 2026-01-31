'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  Edit,
  Eye,
  Plus,
  ArrowLeft,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCoursesPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Mock course data for admin view
  const courses = [
    {
      id: 'eips-101',
      title: 'EIPs 101: From First Principles to First Proposal',
      status: 'published',
      students: 1247,
      completionRate: 78,
      rating: 4.8,
      lessons: 8,
      lastUpdated: '2024-01-15',
      difficulty: 'Beginner'
    },
    {
      id: 'ens-101',
      title: 'ENS 101: Ethereum Name Service Essentials',
      status: 'published',
      students: 892,
      completionRate: 85,
      rating: 4.7,
      lessons: 6,
      lastUpdated: '2024-01-10',
      difficulty: 'Beginner'
    },
    {
      id: '0g-101',
      title: '0G 101: AI-Native Blockchain Infrastructure',
      status: 'published',
      students: 324,
      completionRate: 72,
      rating: 4.9,
      lessons: 10,
      lastUpdated: '2024-01-20',
      difficulty: 'Beginner'
    },
    {
      id: 'blockchain-basics',
      title: 'Blockchain Fundamentals',
      status: 'draft',
      students: 0,
      completionRate: 0,
      rating: 0,
      lessons: 12,
      lastUpdated: '2024-01-05',
      difficulty: 'Beginner'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20';
      case 'archived': return 'bg-slate-500/10 text-slate-400 border-slate-400/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Course Management
          </h1>
          <p className="text-slate-300">
            Manage all courses, lessons, and educational content.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
          <div className="text-sm text-slate-400">
            {courses.length} courses total
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-white">{course.title}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                      <Badge variant="outline" className="text-slate-400 border-slate-600">
                        {course.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-lg font-semibold text-white">{course.students.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Students</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-lg font-semibold text-white">{course.lessons}</p>
                    <p className="text-xs text-slate-400">Lessons</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="text-lg font-semibold text-white">{course.completionRate}%</p>
                    <p className="text-xs text-slate-400">Completion</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-lg font-semibold text-white">{course.rating || 'N/A'}</p>
                    <p className="text-xs text-slate-400">Rating</p>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Settings className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-lg font-semibold text-white">{course.status === 'published' ? 'Live' : 'Draft'}</p>
                    <p className="text-xs text-slate-400">Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Statistics */}
        <div className="mt-8">
          <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Course Statistics</CardTitle>
              <CardDescription>Overview of course performance and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{courses.filter(c => c.status === 'published').length}</p>
                  <p className="text-sm text-slate-400">Published Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{courses.filter(c => c.status === 'draft').length}</p>
                  <p className="text-sm text-slate-400">Draft Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{courses.reduce((sum, c) => sum + c.students, 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total Enrollments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{Math.round(courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length)}%</p>
                  <p className="text-sm text-slate-400">Avg Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}