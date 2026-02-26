'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flame,
  Trophy,
  Star,
  Award,
  TrendingUp,
  Target,
  Zap,
  Crown,
  CheckCircle,
  Clock,
  Users,
  Sprout,
  BookOpen,
  GraduationCap,
  Gem,
  BarChart3,
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserProgress {
  userId: string;
  totalXP: number;
  currentLevel: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: string;
  completedCourses: string[];
  totalLessonsCompleted: number;
  badges: Badge[];
  achievements: Achievement[];
  leaderboardRank: number;
  leaderboardScore: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  unlockedDate?: string;
}

interface GamificationProps {
  userProgress: UserProgress;
  onStreakUpdate?: (newStreak: number) => void;
}

const levelTiers = [
  { level: 1, title: 'Novice', icon: Sprout, color: 'text-green-400', minXP: 0 },
  { level: 5, title: 'Learner', icon: BookOpen, color: 'text-cyan-400', minXP: 5000 },
  { level: 10, title: 'Scholar', icon: GraduationCap, color: 'text-blue-400', minXP: 10000 },
  { level: 15, title: 'Master', icon: Trophy, color: 'text-amber-400', minXP: 15000 },
  { level: 20, title: 'Sage', icon: Crown, color: 'text-purple-400', minXP: 20000 },
];

export default function GamificationDashboard({
  userProgress,
  onStreakUpdate
}: GamificationProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview');
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);

  // Calculate XP for current level
  const xpPerLevel = 1000;
  const currentLevelXP = userProgress.currentLevel * xpPerLevel;
  const nextLevelXP = (userProgress.currentLevel + 1) * xpPerLevel;
  const xpProgress = ((userProgress.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  // Streak animation trigger
  useEffect(() => {
    if (userProgress.streak > 0) {
      setShowStreakAnimation(true);
      const timer = setTimeout(() => setShowStreakAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [userProgress.streak]);

  const getCurrentTier = () => {
    const tier = [...levelTiers].reverse().find(t => t.level <= userProgress.currentLevel);
    return tier || levelTiers[0];
  };

  const currentTier = getCurrentTier();
  const TierIcon = currentTier.icon;

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Level Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20 h-full">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center ring-1 ring-cyan-400/30">
                  <TierIcon className={`h-7 w-7 ${currentTier.color}`} />
                </div>
                <p className="text-slate-400 text-sm mb-1">Level</p>
                <p className="text-4xl font-bold text-cyan-400">{userProgress.currentLevel}</p>
                <p className="text-slate-300 font-semibold mt-1 text-sm">{currentTier.title}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(xpProgress)}%</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {nextLevelXP - userProgress.totalXP} XP to next level
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`bg-gradient-to-br border-orange-400/20 h-full transition-all ${
            showStreakAnimation ? 'from-orange-600 to-red-600' : 'from-slate-900/90 to-slate-800/90'
          }`}>
            <CardContent className="p-6">
              <div className="text-center">
                <motion.div animate={showStreakAnimation ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.6 }}>
                  <Flame className={`h-12 w-12 mx-auto mb-2 ${showStreakAnimation ? 'text-yellow-300' : 'text-orange-400'}`} />
                </motion.div>
                <p className="text-slate-400 text-sm mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-orange-300">{userProgress.streak}</p>
                <p className="text-slate-300 text-sm mt-1">days</p>
                <div className="mt-4 p-2 bg-black/20 rounded-lg">
                  <p className="text-xs text-slate-300">
                    Best: <span className="font-bold text-orange-300">{userProgress.longestStreak}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total XP Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-yellow-400/20 h-full">
            <CardContent className="p-6">
              <div className="text-center">
                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-1">Total XP</p>
                <p className="text-4xl font-bold text-yellow-300">
                  {userProgress.totalXP.toLocaleString()}
                </p>
                <div className="mt-4 p-2 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                  <p className="text-xs text-slate-300">
                    {userProgress.totalLessonsCompleted} lessons completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rank Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-400/20 h-full">
            <CardContent className="p-6">
              <div className="text-center">
                <Crown className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-1">Leaderboard Rank</p>
                <p className="text-4xl font-bold text-purple-300">#{userProgress.leaderboardRank}</p>
                <div className="mt-4 p-2 bg-purple-500/10 rounded-lg border border-purple-400/20">
                  <p className="text-xs text-slate-300">
                    Score: <span className="font-bold text-purple-300">{userProgress.leaderboardScore}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 border-b border-slate-700">
        {([
          { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
          { key: 'badges' as const, label: 'Badges', icon: Award },
          { key: 'achievements' as const, label: 'Achievements', icon: Target },
          { key: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
        ]).map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              selectedTab === key
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <TabIcon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {selectedTab === 'badges' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProgress.badges.length === 0 ? (
            <Card className="col-span-full bg-slate-900/50 border-slate-700">
              <CardContent className="flex flex-col items-center py-12 text-slate-400">
                <Award className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No badges earned yet. Complete courses and milestones to earn badges.</p>
              </CardContent>
            </Card>
          ) : (
            userProgress.badges.map((badge) => (
              <Card
                key={badge.id}
                className={`border ${
                  badge.rarity === 'Legendary' ? 'border-yellow-400/30 bg-yellow-500/5' :
                  badge.rarity === 'Epic' ? 'border-purple-400/30 bg-purple-500/5' :
                  badge.rarity === 'Rare' ? 'border-cyan-400/30 bg-cyan-500/5' :
                  'border-slate-600/30 bg-slate-500/5'
                }`}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className={`h-12 w-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      badge.rarity === 'Legendary' ? 'bg-yellow-500/20 ring-1 ring-yellow-400/30' :
                      badge.rarity === 'Epic' ? 'bg-purple-500/20 ring-1 ring-purple-400/30' :
                      badge.rarity === 'Rare' ? 'bg-cyan-500/20 ring-1 ring-cyan-400/30' :
                      'bg-slate-500/20 ring-1 ring-slate-400/30'
                    }`}>
                      <Gem className={`h-6 w-6 ${
                        badge.rarity === 'Legendary' ? 'text-yellow-400' :
                        badge.rarity === 'Epic' ? 'text-purple-400' :
                        badge.rarity === 'Rare' ? 'text-cyan-400' :
                        'text-slate-400'
                      }`} />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{badge.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{badge.description}</p>
                    <Badge className={`
                      ${badge.rarity === 'Legendary' ? 'bg-yellow-600 text-yellow-100' :
                        badge.rarity === 'Epic' ? 'bg-purple-600 text-purple-100' :
                        badge.rarity === 'Rare' ? 'bg-cyan-600 text-cyan-100' :
                        'bg-slate-600 text-slate-100'}
                    `}>
                      {badge.rarity}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-2">
                      Earned {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {userProgress.achievements.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="flex flex-col items-center py-12 text-slate-400">
                <Target className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No achievements yet. Keep learning to unlock achievements.</p>
              </CardContent>
            </Card>
          ) : (
            userProgress.achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{achievement.title}</h3>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                    </div>
                    {achievement.unlockedDate && (
                      <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-cyan-400 font-medium">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                    <p className="text-xs text-slate-500 text-right">
                      Reward: {achievement.reward}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Progress Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                <span className="text-slate-300 text-sm">Courses Completed</span>
                <span className="text-2xl font-bold text-cyan-400">{userProgress.completedCourses.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                <span className="text-slate-300 text-sm">Lessons Completed</span>
                <span className="text-2xl font-bold text-emerald-400">{userProgress.totalLessonsCompleted}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                <span className="text-slate-300 text-sm">Badges Earned</span>
                <span className="text-2xl font-bold text-purple-400">{userProgress.badges.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userProgress.achievements
                .filter(a => a.unlockedDate)
                .slice(0, 5)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-2 p-2 bg-slate-950/40 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{achievement.title}</p>
                      <p className="text-xs text-slate-500">
                        {achievement.unlockedDate && new Date(achievement.unlockedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              {userProgress.achievements.filter(a => a.unlockedDate).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No achievements unlocked yet.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-purple-400" />
                Your Standing
              </CardTitle>
              <CardDescription>Your position on the community leaderboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
                <div className="text-3xl font-bold text-cyan-400 w-16 text-center">
                  #{userProgress.leaderboardRank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Your Rank</p>
                  <p className="text-sm text-slate-400">{userProgress.leaderboardScore.toLocaleString()} XP · Level {userProgress.currentLevel} {currentTier.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{userProgress.completedCourses.length} courses</p>
                  <p className="text-xs text-slate-500">{userProgress.badges.length} badges</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Visit the <a href="/leaderboard" className="text-cyan-400 hover:underline">full leaderboard</a> to see how you compare with other learners.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
