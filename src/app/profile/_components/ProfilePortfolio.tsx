"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Trophy,
  Zap,
  Users,
  GitBranch,
  Star,
  Target,
  PawPrint,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  handle: string;
}

const rarityColors = {
  Common: "text-gray-400 border-gray-400/30",
  Rare: "text-blue-400 border-blue-400/30",
  Epic: "text-purple-400 border-purple-400/30",
  Legendary: "text-yellow-400 border-yellow-400/30",
};

export default function ProfilePortfolio({ handle }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile by ENS name or user ID
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/ens/lookup?name=${handle}`);
        const data = await response.json();

        if (!data.user) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        // Fetch full user profile
        const profileResponse = await fetch("/api/user/profile");
        const profileData = await profileResponse.json();

        if (profileData.user) {
          const dbUser = profileData.user;
          const avatarFromEns = (data as any)?.ensAvatar || dbUser?.wallets?.find((w: any) => w.ensAvatar)?.ensAvatar || null;

          setProfile({
            ...dbUser,
            ensName: data.ensName || dbUser?.wallets?.find((w: any) => w.ensName)?.ensName || null,
            displayName: dbUser?.name || handle,
            avatar: avatarFromEns || dbUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
            bio: `Web3 learner on eth.ed`,
            verified: !!(data.ensName || dbUser?.wallets?.find((w: any) => w.ensName)),
          });
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [handle]);

  const copyProfile = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/${handle}`);
    setCopied(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="from-cyan-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        </div>
        <Card className="relative z-10 bg-slate-900/90 backdrop-blur-xl border border-cyan-400/20 rounded-2xl max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-slate-400 mb-6">The profile you're looking for doesn't exist or hasn't been set up yet.</p>
            <Button 
              asChild
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <a href="/courses">Browse Courses</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 mb-6 ring-4 ring-cyan-400/20 group-hover:ring-cyan-400/40 transition-all duration-300">
                      <AvatarImage src={profile.avatar} alt={profile.displayName} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 text-2xl font-bold">
                        {profile.displayName.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-400/20 hover:border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/5 h-10 px-4 rounded-xl"
                      onClick={copyProfile}
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Share"}
                    </Button>
                    {profile.ensName && (
                      <Button variant="outline" size="sm" className="border-purple-400/20 hover:border-purple-400/40 text-purple-300 hover:bg-purple-400/5 h-10 px-4 rounded-xl">
                        <Globe className="w-4 h-4 mr-2" />
                        {profile.ensName}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-white">
                      {profile.displayName}
                    </h1>
                    {profile.verified && (
                      <Badge className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 h-6">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl text-slate-400 font-medium">{profile.ensName || profile.handle}</span>
                    <Badge variant="outline" className="text-cyan-400/60 border-cyan-400/20">
                      ENS
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-lg mb-6 max-w-2xl leading-relaxed">{profile.bio}</p>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {profile.followersCount || 0} followers • {profile.followingCount || 0} following
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:w-56">
                  <div className="text-center p-4 rounded-2xl bg-slate-950/40 border border-cyan-400/10 hover:border-cyan-400/30 transition-all duration-300">
                    <div className="text-3xl font-bold text-cyan-400">{profile.streak || 0}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Day Streak</div>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-slate-950/40 border border-purple-400/10 hover:border-purple-400/30 transition-all duration-300">
                    <div className="text-3xl font-bold text-purple-400">{(profile.totalXP || 0).toLocaleString()}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total XP</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl p-1 mb-8">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 transition-all duration-300">
              Overview
            </TabsTrigger>
            <TabsTrigger value="nfts" className="rounded-xl data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400 transition-all duration-300">
              NFTs
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 transition-all duration-300">
              Courses
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all duration-300">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent NFTs */}
              <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Award className="w-5 h-5 text-cyan-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(profile?.nfts || []).slice(0, 3).map((nft: any) => (
                    <div key={nft.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/40 border border-white/5 group hover:border-cyan-400/20 transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-all duration-300 overflow-hidden">
                        {nft.image ? (
                          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                        ) : (
                          <Award className="w-6 h-6 text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">{nft.name}</div>
                        <div className="text-xs text-slate-500">{nft.createdAt ? new Date(nft.createdAt).toLocaleDateString() : ''}</div>
                      </div>
                      <Badge variant="outline" className="text-slate-300 border-slate-400/30">NFT</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Learning Progress */}
              <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Target className="w-5 h-5 text-purple-400" />
                    Course Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(profile?.courses?.slice(0, 3) || mockCourses.slice(0, 3)).map((uc: any, idx: number) => {
                    const course = uc.course || uc;
                    const progress = uc.progress ?? (course.progress ?? 0);
                    return (
                      <div key={uc.id || idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300 truncate">{course.title}</span>
                          <span className="text-xs font-bold text-cyan-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 border border-white/5">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500 shadow-cyan- glow"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Skill Distribution */}
              <Card className="bg-slate-900/60 backdrop-blur-xl border border-cyan-400/10 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Skills Mastered
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30">Web3 Fundamentalist</Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">ENS Holder</Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">Early Adopter</Badge>
                  </div>
                  <p className="text-xs text-slate-400">Earn more badges by completing courses and contributing to the community.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(profile?.nfts || []).map((nft: any) => (
                <Card key={nft.id} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 hover:border-emerald-400/30 transition-colors group">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-purple-400/20 mb-4 flex items-center justify-center group-hover:from-emerald-400/30 group-hover:via-cyan-400/30 group-hover:to-purple-400/30 transition-colors overflow-hidden">
                      {nft.image ? (
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <Award className="w-12 h-12 text-emerald-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">{nft.name}</h3>
                        <Badge variant="outline" className="text-slate-300 border-slate-400/30">NFT</Badge>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{nft.description || (nft.metadata?.description ?? '')}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Minted: {nft.createdAt ? new Date(nft.createdAt).toLocaleDateString() : ''}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {(profile?.courses || mockCourses).map((uc: any, idx: number) => {
                const course = uc.course || uc;
                const progress = uc.progress ?? (course.progress ?? 0);
                return (
                  <Card key={uc.id || idx} className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{course.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-slate-300 border-slate-400/30">
                                {course.difficulty ?? 'Course'}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {progress === 100 ? `Completed` : `${progress}% progress`}
                              </span>
                            </div>
                          </div>
                        </div>
                        {progress === 100 && <Trophy className="w-5 h-5 text-yellow-400" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-white font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {mockActivity.map((activity, index) => (
                <Card key={index} className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-slate-300 border-slate-400/30 capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
const mockNFTs = [
  { id: 1, name: "Early Adopter", description: "Joined eth.ed during alpha", rarity: "Legendary", earned: "Feb 2025" },
  { id: 2, name: "ENS Pioneer", description: "Registered an .ethed.eth subdomain", rarity: "Epic", earned: "Feb 2025" },
];

const mockCourses = [
  { id: 1, title: "Ethereum Basics", difficulty: "Beginner", progress: 100, totalLessons: 5, completedAt: "Feb 2025" },
  { id: 2, title: "Smart Contract Safety", difficulty: "Intermediate", progress: 40, totalLessons: 10 },
];

const mockActivity = [
  { title: "Completed Ethereum Basics", date: "2 hours ago", type: "course", icon: "📚" },
  { title: "Earned Early Adopter NFT", date: "5 hours ago", type: "award", icon: "🏆" },
];
