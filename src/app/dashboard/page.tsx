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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            Welcome back, {session.user.name || 'Learner'}! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Track your progress and continue your journey into the world of EIPs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-900/50 border-cyan-400/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Courses Completed</p>
                  <p className="text-2xl font-bold text-white mt-1">{mockStats.coursesCompleted}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-400/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">NFTs Earned</p>
                  <p className="text-2xl font-bold text-white mt-1">{mockStats.nftsEarned}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-400/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Study Streak</p>
                  <p className="text-2xl font-bold text-white mt-1">{mockStats.studyStreak} days</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <TrendingUp className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-yellow-400/10 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Avg Score</p>
                  <p className="text-2xl font-bold text-white mt-1">{mockStats.averageScore}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Courses */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  Your Courses
                </CardTitle>
                <CardDescription className="text-slate-400">Continue learning where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCourses.map((course) => (
                  <div key={course.id} className="p-6 bg-slate-950/40 rounded-xl border border-white/5 hover:border-cyan-400/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                        <p className="text-sm text-slate-500">Last accessed {course.lastAccessed}</p>
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
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-cyan-400 font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2 bg-slate-800" />
                    </div>
                    <Button 
                      asChild 
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl h-11"
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

          {/* Achievements */}
          <div className="space-y-6">
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Achievements
                </CardTitle>
                <CardDescription className="text-slate-400">Your earned badges and NFTs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAchievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                      achievement.earned 
                        ? 'bg-purple-500/5 border border-purple-400/20' 
                        : 'bg-slate-950/20 border border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        achievement.earned ? 'bg-purple-500/10' : 'bg-slate-800'
                      }`}>
                        <Award className={`h-5 w-5 ${
                          achievement.earned ? 'text-purple-400' : 'text-slate-600'
                        }`} />
                      </div>
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

            <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl group hover:border-cyan-400/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Advance your Skills</h3>
                  <p className="text-slate-400 text-sm mb-6">Master complex EIPs and earn exclusive on-chain certifications.</p>
                  <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl">
                    <Link href="/courses">
                      Browse More Courses
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}