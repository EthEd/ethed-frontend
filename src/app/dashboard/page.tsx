'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  PawPrint
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
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
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Mock data for demo
  const mockStats = {
    coursesEnrolled: 3,
    coursesCompleted: 1,
    totalLessons: 24,
    completedLessons: 8,
    nftsEarned: 2,
    studyStreak: 5,
    totalStudyTime: 12.5, // hours
    averageScore: 85
  };

  const mockCourses = [
    {
      id: 'eips-101',
      title: 'EIPs 101',
      progress: 100,
      status: 'completed',
      nftEarned: true,
      lastAccessed: '2 days ago'
    },
    {
      id: 'ens-101',
      title: 'ENS 101',
      progress: 75,
      status: 'in-progress',
      nftEarned: false,
      lastAccessed: '1 day ago'
    },
    {
      id: '0g-101',
      title: '0G 101',
      progress: 25,
      status: 'in-progress',
      nftEarned: false,
      lastAccessed: '3 days ago'
    }
  ];

  const mockAchievements = [
    { name: 'Genesis Scholar', type: 'Founder', earned: true },
    { name: 'EIP Expert', type: 'Course', earned: true },
    { name: 'ENS Pro', type: 'Course', earned: false },
    { name: '0G Infrastructure', type: 'Course', earned: false },
    { name: 'Study Streak', type: 'Milestone', earned: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Welcome back, {session.user.name || 'Learner'}! 👋
          </h1>
          <p className="text-slate-300">
            Continue your Web3 learning journey and track your progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm font-medium">Courses Completed</p>
                  <p className="text-2xl font-bold text-white">{mockStats.coursesCompleted}</p>
                </div>
                <BookOpen className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">NFTs Earned</p>
                  <p className="text-2xl font-bold text-white">{mockStats.nftsEarned}</p>
                </div>
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border-cyan-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm font-medium">Study Streak</p>
                  <p className="text-2xl font-bold text-white">{mockStats.studyStreak} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Avg Score</p>
                  <p className="text-2xl font-bold text-white">{mockStats.averageScore}%</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                  Your Courses
                </CardTitle>
                <CardDescription>Continue learning where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{course.title}</h3>
                        <p className="text-sm text-slate-400">Last accessed {course.lastAccessed}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.nftEarned && (
                          <Badge variant="outline" className="border-purple-400/40 text-purple-300">
                            <Award className="h-3 w-3 mr-1" />
                            NFT
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={
                            course.status === 'completed' 
                              ? 'border-emerald-400/40 text-emerald-300'
                              : 'border-cyan-400/40 text-cyan-300'
                          }
                        >
                          {course.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-300">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <Button 
                      asChild 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                    >
                      <Link href={`/courses/${course.id}`}>
                        {course.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Achievements & Learning Buddy */}
          <div className="space-y-6">
            {/* Learning Buddy */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-emerald-400" />
                  Your Learning Buddy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl mb-2">🐉</div>
                  <h3 className="font-semibold text-white mb-1">Spark</h3>
                  <p className="text-sm text-slate-400 mb-4">Your wise dragon guide</p>
                  <Button asChild size="sm" variant="outline" className="border-emerald-400/40 text-emerald-300">
                    <Link href="/learn">
                      Chat with Spark
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Achievements
                </CardTitle>
                <CardDescription>Your earned badges and NFTs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAchievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      achievement.earned 
                        ? 'bg-purple-500/10 border border-purple-400/20' 
                        : 'bg-slate-700/20 border border-slate-600/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className={`h-4 w-4 ${
                        achievement.earned ? 'text-purple-400' : 'text-slate-500'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          achievement.earned ? 'text-white' : 'text-slate-400'
                        }`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-slate-500">{achievement.type}</p>
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge variant="outline" className="border-purple-400/40 text-purple-300 text-xs">
                        Earned
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Jump back into learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                  <Link href="/courses">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Link href="/learn">
                    <PawPrint className="h-4 w-4 mr-2" />
                    Chat with Buddy
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Link href="/profile">
                    <Users className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}