'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/monitoring';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, Flame, Star, Loader2, ArrowRight, User } from 'lucide-react';
import Footer from '@/app/(public)/_components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
  xp: number;
  level: number;
  streak: number;
  ensName: string | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        logger.error("Failed to load leaderboard", "LeaderboardPage");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-400 fill-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-slate-300 fill-slate-300" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600 fill-amber-600" />;
      default: return <span className="text-slate-500 font-bold">{rank}</span>;
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 md:py-20">
      <main className="container mx-auto max-w-4xl pt-10">
        <div className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
          >
            <Trophy className="h-4 w-4" />
            Hall of Scholars
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Global Explorer Rankings
          </h1>
          <p className="text-slate-400 text-lg">
            Celebrating the top contributors and lifelong learners in the EthEd ecosystem.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-500">Retrieving blockchain records...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Podium for Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative p-8 rounded-3xl border text-center space-y-4 ${
                    user.rank === 1 
                      ? "bg-blue-500/10 border-blue-500/40 order-1 md:order-2 md:scale-110 z-10" 
                      : user.rank === 2 
                        ? "bg-slate-900 border-slate-800 order-2 md:order-1" 
                        : "bg-slate-900 border-slate-800 order-3"
                  }`}
                >
                  <div className="absolute top-4 right-4">{getRankIcon(user.rank)}</div>
                  <div className="relative mx-auto w-24 h-24">
                    <Avatar className="w-full h-full border-4 border-black shadow-2xl">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-slate-800 text-2xl font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold truncate">
                      {user.ensName || user.name || 'Anonymous'}
                    </h2>
                    <p className="text-blue-400 font-mono text-sm uppercase tracking-wider">Level {user.level}</p>
                  </div>
                  <div className="flex justify-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {user.xp} XP
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {user.streak} Days
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full mt-4 bg-transparent border-slate-700 hover:bg-slate-800">
                    <Link href={`/profile/${user.id}`}>View Portfolio</Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* List for Others */}
            <div className="space-y-3">
              {others.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/profile/${user.id}`}>
                    <Card className="bg-slate-900/40 border-slate-800 hover:bg-slate-900 transition-colors cursor-pointer group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-8 flex justify-center font-mono text-slate-600 group-hover:text-blue-400 transition-colors">
                          {user.rank}
                        </div>
                        <Avatar className="h-10 w-10 border border-slate-800">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold group-hover:text-blue-300 transition-colors">
                            {user.ensName || user.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-slate-500">Level {user.level} Explorer</p>
                        </div>
                        <div className="text-right flex items-center gap-6">
                          <div className="hidden sm:block text-xs font-medium text-slate-500 uppercase tracking-tighter">
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {user.streak}d
                            </span>
                          </div>
                          <div className="font-bold text-blue-400 min-w-[80px]">
                            {user.xp} <span className="text-[10px] text-slate-500 font-normal">XP</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) }
      </main>

      <Footer />
    </div>
  );
}
