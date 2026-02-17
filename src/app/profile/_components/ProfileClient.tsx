'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  Trophy,
  Loader2,
  ExternalLink,
  ArrowRight,
  BarChart3,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ipfsToGatewayUrl } from '@/lib/ipfs';

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  ensName: string | null;
  walletAddress: string | null;
  stats: {
    coursesEnrolled: number;
    coursesCompleted: number;
    coursesInProgress: number;
    nftsEarned: number;
    averageProgress: number;
    totalLessonsCompleted: number;
    studyStreak: number;
    joinedDate: string;
    lastActive: string;
  };
  courses: Array<{
    id: string;
    slug: string;
    title: string;
    progress: number;
    completed: boolean;
    completedAt: string | null;
    startedAt: string;
    nftClaimed: boolean;
  }>;
  nfts: Array<{
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    tokenId: string | null;
    metadata: any;
    createdAt: string;
    type: string;
  }>;
}

export default function ProfileClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile-data');
      const data = await response.json();

      if (!data.success) {
        if (data.error === 'Unauthorized') {
          router.push('/login');
          return;
        }
        const errText = typeof data.error === 'string' ? data.error : (data.error ? JSON.stringify(data.error) : null);
        toast.error(errText || 'Failed to load profile');
        return;
      }

      setProfile(data.profile);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  const { stats, courses, nfts } = profile;

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="from-cyan-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-300">Profile</span>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="w-32 h-32 mb-4 ring-4 ring-cyan-400/20 hover:ring-cyan-400/40 transition-all duration-300">
                    <AvatarImage src={profile.image || undefined} alt={profile.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-3xl font-bold">
                      {profile.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {profile.ensName && (
                    <Badge className="bg-purple-500/10 text-purple-300 border-purple-400/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {profile.ensName}
                    </Badge>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {profile.name || 'Anonymous Learner'}
                  </h1>
                  <p className="text-slate-400 mb-4">{profile.email}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      Joined {new Date(stats.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      Last active {new Date(stats.lastActive).toLocaleDateString()}
                    </span>
                    {profile.walletAddress && (
                      <span className="flex items-center gap-2 text-xs font-mono">
                        {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                      </span>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-slate-950/40 border border-cyan-400/10">
                      <div className="text-2xl font-bold text-cyan-400">{stats.coursesCompleted}</div>
                      <div className="text-xs text-slate-400 mt-1">Completed</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-950/40 border border-purple-400/10">
                      <div className="text-2xl font-bold text-purple-400">{stats.nftsEarned}</div>
                      <div className="text-xs text-slate-400 mt-1">NFTs</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-950/40 border border-cyan-400/10">
                      <div className="text-2xl font-bold text-cyan-400">{stats.averageProgress}%</div>
                      <div className="text-xs text-slate-400 mt-1">Avg Progress</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-950/40 border border-emerald-400/10">
                      <div className="text-2xl font-bold text-emerald-400">{stats.totalLessonsCompleted}</div>
                      <div className="text-xs text-slate-400 mt-1">Lessons</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400">
              NFTs ({nfts.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Learning Progress */}
              <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    Course Progress
                  </CardTitle>
                  <CardDescription>Your active learning journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">No courses enrolled yet</p>
                      <Button asChild className="bg-cyan-600 hover:bg-cyan-500">
                        <Link href="/learn">Browse Courses</Link>
                      </Button>
                    </div>
                  ) : (
                    courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              course.completed 
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-cyan-500/10 border border-cyan-500/20'
                            }`}>
                              {course.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-cyan-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{course.title}</h3>
                              <p className="text-xs text-slate-400">
                                {course.completed 
                                  ? `Completed ${new Date(course.completedAt!).toLocaleDateString()}`
                                  : `Started ${new Date(course.startedAt).toLocaleDateString()}`
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {course.nftClaimed && (
                              <Badge className="bg-purple-500/10 text-purple-300 border-purple-400/20">
                                <Award className="h-3 w-3 mr-1" />
                                NFT
                              </Badge>
                            )}
                            <span className="text-sm font-bold text-cyan-400">{course.progress}%</span>
                          </div>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Stats Summary */}
              <div className="space-y-6">
                <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      Learning Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Total Enrolled</span>
                      <span className="font-bold text-white">{stats.coursesEnrolled}</span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Completed</span>
                      <span className="font-bold text-emerald-400">{stats.coursesCompleted}</span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">In Progress</span>
                      <span className="font-bold text-cyan-400">{stats.coursesInProgress}</span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">NFTs Earned</span>
                      <span className="font-bold text-purple-400">{stats.nftsEarned}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-xl border border-cyan-400/20 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Keep Learning!</h3>
                    <p className="text-slate-300 text-sm mb-4">
                      Explore more courses and earn exclusive NFT badges
                    </p>
                    <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-500">
                      <Link href="/learn">
                        Browse Courses
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            {courses.length === 0 ? (
              <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
                  <p className="text-slate-400 mb-6">Start your learning journey today!</p>
                  <Button asChild className="bg-cyan-600 hover:bg-cyan-500">
                    <Link href="/learn">Browse All Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl hover:border-cyan-400/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            course.completed 
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-cyan-500/10 border border-cyan-500/20'
                          }`}>
                            {course.completed ? (
                              <Trophy className="h-6 w-6 text-emerald-400" />
                            ) : (
                              <BookOpen className="h-6 w-6 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{course.title}</h3>
                            <p className="text-xs text-slate-400">
                              {course.completed ? 'Completed' : 'In Progress'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-400">Progress</span>
                          <span className="font-bold text-cyan-400">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        {course.nftClaimed ? (
                          <Badge className="bg-purple-500/10 text-purple-300 border-purple-400/20">
                            <Award className="h-3 w-3 mr-1" />
                            NFT Claimed
                          </Badge>
                        ) : course.completed ? (
                          <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-400/20">
                            Ready to claim NFT
                          </Badge>
                        ) : (
                          <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-400/20">
                            {course.progress}% Complete
                          </Badge>
                        )}
                        <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500 h-9">
                          <Link href={`/courses/${course.slug}`}>
                            {course.completed ? 'Review' : 'Continue'}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            {nfts.length === 0 ? (
              <Card className="bg-slate-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Award className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No NFTs Yet</h3>
                  <p className="text-slate-400 mb-6">Complete courses to earn exclusive NFT badges!</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-500">
                    <Link href="/learn">Start Learning</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft) => (
                  <Card key={nft.id} className="bg-slate-900/40 backdrop-blur-xl border border-purple-400/10 rounded-2xl hover:border-purple-400/30 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-emerald-500/20 mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden relative">
                        {nft.image ? (
                          <Image
                            src={ipfsToGatewayUrl(nft.image)}
                            alt={nft.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <Award className="h-16 w-16 text-purple-400" />
                        )}
                      </div>
                      <h3 className="font-bold text-white mb-2">{nft.name}</h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        {nft.description || 'Course completion achievement'}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-purple-500/10 text-purple-300 border-purple-400/20 text-xs">
                          {nft.type === 'course-completion' ? 'Course' : 'Achievement'}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(nft.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
