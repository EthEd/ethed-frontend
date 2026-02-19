import { prisma } from "@/lib/prisma-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { 
  Trophy, 
  Flame, 
  Star, 
  BookOpen, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Award
} from "lucide-react";
import Footer from "@/app/(public)/_components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true }
  });

  if (!user) return {};

  const title = `${user.name || 'User'}'s Portfolio | EthEd`;
  const description = `Check out ${user.name || 'this user'}'s learning progress and Web3 achievements on EthEd.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og/profile/${id}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/profile/${id}`],
    },
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      courses: {
        include: {
          course: true,
        },
      },
      nfts: true,
      wallets: true,
    },
  });

  if (!user) {
    notFound();
  }

  const stats = {
    coursesEnrolled: user.courses.length,
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    joinedDate: user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-8 md:p-12 mb-8">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-64 h-64" />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <Avatar className="w-32 h-32 border-4 border-blue-500/20">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-4xl bg-blue-500/10 text-blue-400">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    {user.name || 'Anonymous Learner'}
                  </h1>
                  <p className="text-neutral-400 flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {stats.joinedDate}
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400 py-1 px-3">
                    Level {stats.level} Explorer
                  </Badge>
                  <Badge variant="outline" className="bg-orange-500/5 border-orange-500/20 text-orange-400 py-1 px-3">
                    <Flame className="w-3 h-3 mr-1 fill-current" />
                    {stats.streak} Day Streak
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-400 py-1 px-3">
                    <Award className="w-3 h-3 mr-1" />
                    {user.nfts.length} Certifications
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Experience Points</span>
                      <span className="text-white font-medium">{stats.xp} XP</span>
                    </div>
                    <Progress value={(stats.xp % 100)} className="h-2 bg-neutral-800" />
                    <p className="text-[10px] text-neutral-500 text-right">
                      {100 - (stats.xp % 100)} XP to Next Level
                    </p>
                  </div>
                  
                  <Separator className="bg-neutral-800" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Courses</p>
                      <p className="text-xl font-bold">{stats.coursesEnrolled}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Certificates</p>
                      <p className="text-xl font-bold">{user.nfts.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="text-lg">Connected IDs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.wallets.map((wallet: any) => (
                    <div key={wallet.address} className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-blue-400">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </span>
                        {wallet.ensName && (
                          <span className="text-sm font-medium">{wallet.ensName}</span>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-600" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Courses & Achievements */}
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold px-1">Learning Journey</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.courses.length > 0 ? (
                    user.courses.map((uc: any) => (
                      <Card key={uc.courseId} className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-blue-500/30 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-none mb-2">
                              {uc.course.level}
                            </Badge>
                            {uc.completed && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-1">{uc.course.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs text-neutral-400">
                              <span>Progress</span>
                              <span>{uc.progress}%</span>
                            </div>
                            <Progress value={uc.progress} className="h-1.5 bg-neutral-800" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center rounded-3xl border border-dashed border-neutral-800 text-neutral-500">
                      No courses started yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold px-1">Digital Credentials</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {user.nfts.length > 0 ? (
                    user.nfts.map((nft: any) => (
                      <div key={nft.id} className="group relative aspect-square rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
                        {nft.metadataUri && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] uppercase tracking-tighter text-blue-400">Genesis NFT</p>
                          </div>
                        )}
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <Star className="w-12 h-12 text-blue-500/20 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                        </div>
                      </div>
                    ))
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-neutral-900/50 border border-dashed border-neutral-800 flex items-center justify-center">
                        <Star className="w-8 h-8 text-neutral-800" />
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
