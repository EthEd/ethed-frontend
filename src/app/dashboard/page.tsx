'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Award, TrendingUp, Star, ArrowRight, BarChart3,
  Sparkles, CheckCircle2, Clock, Calendar, Trophy, Loader2,
  Share2, ExternalLink, Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import { ipfsToGatewayUrl } from '@/lib/ipfs';
import NFTShareModal from '@/components/nft-share-modal';

interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  xp: number;
  level: number;
  streak: number;
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
    contractAddress: string | null;
    transactionHash: string | null;
    chainId: number | null;
    createdAt: string;
    type: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [shareNft, setShareNft] = useState<ProfileData['nfts'][0] | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile-data');
      const data = await response.json();
      if (!data.success) {
        if (data.error === 'Unauthorized') { router.push('/login'); return; }
        toast.error(typeof data.error === 'string' ? data.error : 'Failed to load profile');
        return;
      }
      setProfile(data.profile);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNFTs = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const toastId = toast.loading('Syncing NFTs from blockchain...');
    try {
      const res = await fetch('/api/user/nft-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.synced > 0) { toast.success(`Synced ${data.synced} new NFTs!`, { id: toastId }); fetchProfile(); }
        else toast.info('Collection is up to date', { id: toastId });
      } else throw new Error(data.error || 'Sync failed');
    } catch { toast.error('Failed to sync NFTs', { id: toastId }); }
    finally { setIsSyncing(false); }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }
    fetchProfile();

    // Auto-sync NFTs once per browser session (silently, no toast on 0 results)
    const SYNC_KEY = 'ethed_nft_synced';
    if (!sessionStorage.getItem(SYNC_KEY)) {
      sessionStorage.setItem(SYNC_KEY, '1');
      fetch('/api/user/nft-sync', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.synced > 0) {
            toast.success(`Synced ${data.synced} new NFT${data.synced > 1 ? 's' : ''} from chain!`);
            fetchProfile();
          }
        })
        .catch(() => {}); // silent fail
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) return null;
  const { stats, courses, nfts } = profile;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <Card className="border-border/50 rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-primary/20">
                    <AvatarImage src={profile.image || undefined} alt={profile.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-2xl font-bold">
                      {profile.name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {profile.ensName && (
                    <Badge className="mt-3 bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-400/20">
                      <Sparkles className="w-3 h-3 mr-1" />{profile.ensName}
                    </Badge>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    Welcome back, {profile.ensName || profile.name || 'Learner'}! 👋
                  </h1>
                  <p className="text-muted-foreground mb-4">{profile.email}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" />Joined {new Date(stats.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-500" />Last active {new Date(stats.lastActive).toLocaleDateString()}</span>
                    {profile.walletAddress && <span className="font-mono text-xs">{profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: 'Level', value: profile.level || 1, color: 'text-yellow-500 dark:text-yellow-400', Icon: Star },
                      { label: 'XP', value: profile.xp || 0, color: 'text-primary', Icon: TrendingUp },
                      { label: 'Streak', value: `${profile.streak || 0}d`, color: 'text-orange-500 dark:text-orange-400', Icon: Flame },
                      { label: 'Completed', value: stats.coursesCompleted, color: 'text-emerald-500 dark:text-emerald-400', Icon: CheckCircle2 },
                      { label: 'NFTs', value: stats.nftsEarned, color: 'text-purple-500 dark:text-purple-400', Icon: Award },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                        <s.Icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                        <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 bg-muted/60 border border-border/50 rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Overview</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Courses ({courses.length})</TabsTrigger>
            <TabsTrigger value="nfts" className="rounded-xl data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">NFTs ({nfts.length})</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400">Stats</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-border/50 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Your Courses</CardTitle>
                  <CardDescription>Continue where you left off</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No courses enrolled yet</p>
                      <Button asChild><Link href="/learn">Browse Courses</Link></Button>
                    </div>
                  ) : courses.slice(0, 3).map((c) => (
                    <div key={c.id} className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-primary/10 border border-primary/20'}`}>
                            {c.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <BookOpen className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{c.title}</h3>
                            <p className="text-xs text-muted-foreground">{c.completed ? `Completed ${new Date(c.completedAt!).toLocaleDateString()}` : `Started ${new Date(c.startedAt).toLocaleDateString()}`}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">{c.progress}%</span>
                      </div>
                      <Progress value={c.progress} className="h-2 mb-3" />
                      <Button asChild size="sm" className="w-full"><Link href={`/learn/${c.slug}`}>{c.completed ? 'Review' : 'Continue'}<ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-border/50 rounded-2xl">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-purple-500" />Stats</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { l: 'Enrolled', v: stats.coursesEnrolled, c: 'text-foreground' },
                      { l: 'Completed', v: stats.coursesCompleted, c: 'text-emerald-500' },
                      { l: 'In Progress', v: stats.coursesInProgress, c: 'text-primary' },
                      { l: 'NFTs', v: stats.nftsEarned, c: 'text-purple-500' },
                    ].map((i, idx) => (
                      <div key={i.l}>
                        <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">{i.l}</span><span className={`font-bold ${i.c}`}>{i.v}</span></div>
                        {idx < 3 && <Separator className="mt-3 bg-border/30" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {nfts.length > 0 && (
                  <Card className="border-border/50 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span className="flex items-center gap-2"><Award className="h-5 w-5 text-purple-500" />Recent NFTs</span>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('nfts')} className="text-xs">View All</Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {nfts.slice(0, 3).map((n) => (
                          <div key={n.id} className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/10 via-primary/10 to-emerald-500/10 flex items-center justify-center overflow-hidden border border-border/30 hover:border-purple-400/30 transition-all cursor-pointer relative" onClick={() => setShareNft(n)}>
                            {n.image ? <Image src={ipfsToGatewayUrl(n.image)} alt={n.name} fill sizes="120px" className="object-cover" /> : <Award className="h-8 w-8 text-purple-400" />}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Keep Learning!</h3>
                    <p className="text-muted-foreground text-sm mb-4">Explore courses and earn NFTs</p>
                    <Button asChild className="w-full"><Link href="/learn">Browse Courses<ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Courses */}
          <TabsContent value="courses" className="space-y-4">
            {courses.length === 0 ? (
              <Card className="border-border/50 rounded-2xl"><CardContent className="p-12 text-center"><BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">No Courses Yet</h3><p className="text-muted-foreground mb-6">Start your Web3 journey!</p><Button asChild><Link href="/learn">Browse Courses</Link></Button></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((c) => (
                  <Card key={c.id} className="border-border/50 rounded-2xl hover:border-primary/20 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-primary/10 border border-primary/20'}`}>
                          {c.completed ? <Trophy className="h-6 w-6 text-emerald-500" /> : <BookOpen className="h-6 w-6 text-primary" />}
                        </div>
                        <div><h3 className="font-bold text-foreground">{c.title}</h3><p className="text-xs text-muted-foreground">{c.completed ? 'Completed' : 'In Progress'}</p></div>
                      </div>
                      <div className="mb-4"><div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Progress</span><span className="font-bold text-primary">{c.progress}%</span></div><Progress value={c.progress} className="h-2" /></div>
                      <div className="flex items-center justify-between">
                        {c.nftClaimed ? <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-400/20"><Award className="h-3 w-3 mr-1" />NFT</Badge> : c.completed ? <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-400/20">Claim NFT</Badge> : <Badge variant="outline">{c.progress}%</Badge>}
                        <Button asChild size="sm"><Link href={`/learn/${c.slug}`}>{c.completed ? 'Review' : 'Continue'}<ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* NFTs */}
          <TabsContent value="nfts" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold">Your NFT Collection</h2><p className="text-muted-foreground">Certificates earned through learning</p></div>
              <Button onClick={handleSyncNFTs} variant="outline" disabled={isSyncing}>
                {isSyncing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing...</> : <><TrendingUp className="h-4 w-4 mr-2" />Sync</>}
              </Button>
            </div>
            {nfts.length === 0 ? (
              <Card className="border-border/50 rounded-2xl"><CardContent className="p-12 text-center"><Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">No NFTs Yet</h3><p className="text-muted-foreground mb-6">Complete courses to earn NFTs!</p><Button asChild><Link href="/learn">Start Learning</Link></Button></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((n) => (
                  <Card key={n.id} className="border-border/50 rounded-2xl hover:border-purple-400/30 transition-all group">
                    <CardContent className="p-6">
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/10 via-primary/10 to-emerald-500/10 mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden relative border border-border/30">
                        {n.image ? <Image src={ipfsToGatewayUrl(n.image)} alt={n.name} fill sizes="(max-width:768px)100vw,33vw" className="object-cover" /> : <Award className="h-16 w-16 text-purple-400" />}
                      </div>
                      <h3 className="font-bold mb-1">{n.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{n.description || n.metadata?.description || 'Achievement'}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-400/20 text-xs">{n.type === 'course-completion' ? 'Course' : 'Achievement'}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setShareNft(n)}><Share2 className="h-3 w-3 mr-1" />Share</Button>
                        {n.transactionHash && <Button variant="outline" size="sm" asChild><a href={`https://amoy.polygonscan.com/tx/${n.transactionHash}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a></Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stats */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { Icon: Star, label: 'Level', value: profile.level || 1, sub: `${((profile.xp||0)%1000)}/1000 XP`, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                { Icon: Flame, label: 'Streak', value: `${profile.streak||0}d`, sub: 'Keep it up!', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                { Icon: TrendingUp, label: 'Total XP', value: (profile.xp||0).toLocaleString(), sub: `Level ${profile.level||1}`, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                { Icon: Award, label: 'NFTs', value: stats.nftsEarned, sub: `${stats.coursesCompleted} courses`, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
              ].map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`border-border/50 ${s.border} rounded-2xl`}>
                    <CardContent className="p-6 text-center">
                      <div className={`h-12 w-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}><s.Icon className={`h-6 w-6 ${s.color}`} /></div>
                      <p className="text-muted-foreground text-sm mb-1">{s.label}</p>
                      <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-border/50 rounded-2xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Level Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Level {profile.level||1}</span><span className="text-primary font-medium">{(profile.xp||0)%1000}/1000 XP</span></div>
                <Progress value={((profile.xp||0)%1000)/10} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">{1000-((profile.xp||0)%1000)} XP to Level {(profile.level||1)+1}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 rounded-2xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { l: 'Courses Completed', v: stats.coursesCompleted },
                    { l: 'Lessons Done', v: stats.totalLessonsCompleted },
                    { l: 'Avg Progress', v: `${stats.averageProgress}%` },
                    { l: 'Study Streak', v: `${stats.studyStreak} days` },
                  ].map((i) => (
                    <div key={i.l} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"><span className="text-muted-foreground">{i.l}</span><span className="font-bold">{i.v}</span></div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-border/50 rounded-2xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" />Milestones</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'First Course', earned: stats.coursesEnrolled > 0 },
                    { name: 'Course Completer', earned: stats.coursesCompleted > 0 },
                    { name: 'NFT Collector', earned: stats.nftsEarned > 0 },
                    { name: 'Week Warrior', earned: (profile.streak||0) >= 7 },
                    { name: 'ENS Pioneer', earned: !!profile.ensName },
                  ].map((m) => (
                    <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl ${m.earned ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-muted/20 border border-border/30 opacity-60'}`}>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${m.earned ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                        {m.earned ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Star className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <span className={`text-sm font-medium ${m.earned ? 'text-foreground' : 'text-muted-foreground'}`}>{m.name}</span>
                      {m.earned && <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/20 text-xs">Earned</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {shareNft && <NFTShareModal nft={shareNft} open={!!shareNft} onClose={() => setShareNft(null)} />}
    </div>
  );
}
