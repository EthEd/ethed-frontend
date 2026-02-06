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
  Users
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

  const levelBadges = [
    { level: 1, title: 'Novice', icon: '🌱', minXP: 0 },
    { level: 5, title: 'Learner', icon: '📚', minXP: 5000 },
    { level: 10, title: 'Scholar', icon: '🎓', minXP: 10000 },
    { level: 15, title: 'Master', icon: '🏆', minXP: 15000 },
    { level: 20, title: 'Sage', icon: '👑', minXP: 20000 }
  ];

  const getCurrentLevelTitle = () => {
    return levelBadges.find(b => b.level <= userProgress.currentLevel)?.title || 'Novice';
  };

  const getCurrentLevelIcon = () => {
    return levelBadges.find(b => b.level <= userProgress.currentLevel)?.icon || '🌱';
  };

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20 h-full">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-6xl mb-2">{getCurrentLevelIcon()}</div>
                <p className="text-slate-400 text-sm mb-2">Level</p>
                <p className="text-4xl font-bold text-cyan-400">{userProgress.currentLevel}</p>
                <p className="text-slate-300 font-semibold mt-2">{getCurrentLevelTitle()}</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`bg-gradient-to-br border-orange-400/20 h-full transition-all ${
            showStreakAnimation ? 'from-orange-600 to-red-600' : 'from-slate-900/90 to-slate-800/90'
          }`}>
            <CardContent className="p-6">
              <div className="text-center">
                <motion.div
                  animate={showStreakAnimation ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Flame className={`h-12 w-12 mx-auto mb-2 ${
                    showStreakAnimation ? 'text-yellow-300' : 'text-orange-400'
                  }`} />
                </motion.div>
                <p className="text-slate-400 text-sm mb-2">Current Streak</p>
                <p className="text-4xl font-bold text-orange-300">{userProgress.streak}</p>
                <p className="text-slate-300 text-sm mt-2">days</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-yellow-400/20 h-full">
            <CardContent className="p-6">
              <div className="text-center">
                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Total XP</p>
                <p className="text-4xl font-bold text-yellow-300">
                  {userProgress.totalXP.toLocaleString()}
                </p>
                <div className="mt-4 p-2 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                  <p className="text-xs text-slate-300">
                    This month: <span className="font-bold text-yellow-300">+1,250</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rank Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-400/20 h-full">
            <CardContent className="p-6">
              <div className="text-center">
                <Crown className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm mb-2">Leaderboard Rank</p>
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
      <div className="flex gap-2 border-b border-slate-700">
        {(['overview', 'badges', 'achievements', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-3 font-medium transition-all border-b-2 ${
              selectedTab === tab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'badges' && '🏅 Badges'}
            {tab === 'achievements' && '🎯 Achievements'}
            {tab === 'leaderboard' && '🏆 Leaderboard'}
          </button>
        ))}
      </div>

      {/* Badges Tab */}
      {selectedTab === 'badges' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {userProgress.badges.map((badge) => (
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
                  <div className="text-4xl mb-2">{badge.icon}</div>
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
          ))}
        </motion.div>
      )}

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {userProgress.achievements.map((achievement) => (
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
          ))}
        </motion.div>
      )}

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Quick Stats */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                <span className="text-slate-300">Courses Completed</span>
                <span className="text-2xl font-bold text-cyan-400">{userProgress.completedCourses.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                <span className="text-slate-300">Lessons Completed</span>
                <span className="text-2xl font-bold text-emerald-400">{userProgress.totalLessonsCompleted}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                <span className="text-slate-300">Badges Earned</span>
                <span className="text-2xl font-bold text-purple-400">{userProgress.badges.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Top Learners This Week
              </CardTitle>
              <CardDescription>Compete with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { rank: 1, name: 'You', xp: userProgress.leaderboardScore, trend: '↑' },
                { rank: 2, name: 'Alex Chen', xp: 4850, trend: '↓' },
                { rank: 3, name: 'Sarah Dev', xp: 4620, trend: '↑' },
                { rank: 4, name: 'Jordan', xp: 4350, trend: '→' },
                { rank: 5, name: 'Morgan', xp: 4100, trend: '↑' }
              ].map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    user.name === 'You'
                      ? 'bg-cyan-500/10 border border-cyan-400/30'
                      : 'bg-slate-950/40'
                  }`}
                >
                  <div className="text-2xl font-bold text-slate-500 w-8 text-center">
                    #{user.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.xp} XP</p>
                  </div>
                  <span className={`text-sm font-bold ${
                    user.trend === '↑' ? 'text-emerald-400' :
                    user.trend === '↓' ? 'text-red-400' :
                    'text-slate-400'
                  }`}>
                    {user.trend}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
