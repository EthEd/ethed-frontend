'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import GamificationDashboard from '@/components/GamificationDashboard';
import DiscussionBoard from '@/components/DiscussionBoard';
import CourseModulePage from '@/components/CourseModulePage';
import { BookOpen, Flame, Trophy, MessageCircle } from 'lucide-react';

/**
 * DEMO: Learning Hub Dashboard
 * 
 * This page demonstrates how to integrate all the course flow improvements:
 * - EnhancedLessonViewer
 * - GamificationDashboard
 * - DiscussionBoard
 * - CourseModulePage
 * 
 * To use this in production, replace mock data with actual user/course data from your database.
 */

const mockUserProgress = {
  userId: 'user-123',
  totalXP: 5250,
  currentLevel: 5,
  streak: 12,
  longestStreak: 24,
  lastActivityDate: '2025-02-05',
  completedCourses: ['eips-101', 'ens-101'],
  totalLessonsCompleted: 18,
  badges: [
    {
      id: 'first-lesson',
      name: 'First Step',
      description: 'Complete your first lesson',
      icon: '🌱',
      earnedDate: '2025-01-15',
      rarity: 'Common' as const
    },
    {
      id: 'streak-7',
      name: 'On Fire!',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      earnedDate: '2025-02-01',
      rarity: 'Rare' as const
    },
    {
      id: 'course-complete',
      name: 'Course Master',
      description: 'Complete an entire course',
      icon: '🏆',
      earnedDate: '2025-01-28',
      rarity: 'Epic' as const
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'First 100 XP',
      description: 'Earn 100 XP in a single day',
      progress: 85,
      target: 100,
      reward: '🌟 Bronze Badge',
      unlockedDate: undefined
    },
    {
      id: 'ach-2',
      title: '5 Courses Completed',
      description: 'Complete 5 full courses',
      progress: 2,
      target: 5,
      reward: '👑 Platinum Badge',
      unlockedDate: undefined
    },
    {
      id: 'ach-3',
      title: 'Perfect Quiz Score',
      description: 'Score 100% on 3 quizzes',
      progress: 2,
      target: 3,
      reward: '💎 Diamond Badge'
    }
  ],
  leaderboardRank: 42,
  leaderboardScore: 5250
};

const mockCourseModules = [
  {
    id: 'module-1',
    title: 'Blockchain Fundamentals',
    description: 'Learn the core concepts of blockchain technology',
    estimatedTime: '3 hours',
    icon: '📚',
    rewardBadge: '🌟',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'What is Blockchain?',
        content: `
          Blockchain is a distributed ledger technology that maintains a secure and decentralized record of transactions.
          
          Key characteristics:
          - Distributed: Copies across multiple nodes
          - Immutable: Once recorded, data cannot be changed
          - Transparent: All participants can view transactions
          - Secure: Uses cryptographic hashing
          
          In this lesson, you'll learn how these properties work together to create a trustless system.
        `,
        duration: '20 mins',
        type: 'reading' as const,
        xpReward: 50,
        difficulty: 'Beginner' as const,
        keyTakeaways: [
          'Blockchain maintains distributed records',
          'Cryptographic hashing ensures immutability',
          'Consensus mechanisms replace centralized trust'
        ],
        quiz: {
          questions: [
            {
              id: 'q1',
              question: 'What makes blockchain immutable?',
              options: [
                'Centralized control',
                'Cryptographic hashing',
                'Government regulation',
                'Expensive hardware'
              ],
              correct: 1,
              explanation: 'Cryptographic hashing creates a unique fingerprint of each block, making changes detectable.'
            },
            {
              id: 'q2',
              question: 'Which property allows blockchains to work without a central authority?',
              options: [
                'Transparency',
                'Decentralization',
                'Speed',
                'Cost efficiency'
              ],
              correct: 1,
              explanation: 'Decentralization means no single entity controls the network, enabling trustless transactions.'
            }
          ],
          passingScore: 70
        }
      },
      {
        id: 'lesson-1-2',
        title: 'Consensus Mechanisms',
        content: 'Learn about Proof of Work and Proof of Stake...',
        duration: '25 mins',
        type: 'video' as const,
        xpReward: 60,
        difficulty: 'Beginner' as const,
        keyTakeaways: [
          'PoW uses computational puzzle solving',
          'PoS uses coin holdings for validator selection',
          'Modern chains shift toward PoS for efficiency'
        ]
      },
      {
        id: 'lesson-1-3',
        title: 'Hashing and Merkle Trees',
        content: 'Understand cryptographic hashing...',
        duration: '30 mins',
        type: 'reading' as const,
        xpReward: 70,
        difficulty: 'Intermediate' as const,
        keyTakeaways: [
          'SHA-256 produces unique fixed-length hashes',
          'Merkle trees enable efficient verification',
          'Tree structure allows quick proof-of-inclusion'
        ]
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Smart Contracts Introduction',
    description: 'Your first steps into decentralized applications',
    estimatedTime: '4 hours',
    icon: '💻',
    rewardBadge: '✨',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'What are Smart Contracts?',
        content: 'Smart contracts are self-executing programs on the blockchain...',
        duration: '20 mins',
        type: 'reading' as const,
        xpReward: 50,
        difficulty: 'Beginner' as const,
        keyTakeaways: [
          'Smart contracts are code stored on blockchain',
          'They execute when conditions are met',
          'They eliminate need for intermediaries'
        ]
      },
      {
        id: 'lesson-2-2',
        title: 'Intro to Solidity',
        content: 'Let\'s write our first Solidity contract...',
        duration: '45 mins',
        type: 'coding' as const,
        xpReward: 100,
        difficulty: 'Intermediate' as const,
        keyTakeaways: [
          'Solidity syntax basics',
          'Function and variable declarations',
          'Gas optimization principles'
        ]
      }
    ]
  }
];

export default function LearningHubDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'community' | 'achievements'>('overview');
  const [courseProgress, setCourseProgress] = useState(45);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-400/5"></div>
        <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl bg-cyan-400/10"></div>
        <div className="absolute bottom-0 right-0 -z-10 h-[600px] w-[600px] rounded-full blur-3xl bg-purple-400/10"></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BookOpen className="h-10 w-10 text-cyan-400" />
                Learning Hub
              </h1>
              <p className="text-slate-400">
                Track your progress, earn achievements, and master blockchain development
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                Level {mockUserProgress.currentLevel}
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <Flame className="h-5 w-5" />
                <span className="font-semibold">{mockUserProgress.streak} day streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-4 bg-slate-900/50 border border-slate-700 p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-600"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-600"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center gap-2 data-[state=active]:bg-cyan-600"
            >
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GamificationDashboard
                userProgress={mockUserProgress}
                onStreakUpdate={() => {}}
              />
            </motion.div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    Active Course: Blockchain Fundamentals
                  </CardTitle>
                  <CardDescription>
                    You're making great progress! Keep up the momentum.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Course Progress</span>
                      <span className="text-cyan-400 font-bold">{courseProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${courseProgress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      ></motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <CourseModulePage
                courseId="blockchain-fundamentals"
                courseName="Blockchain Fundamentals"
                modules={mockCourseModules}
                totalLessons={5}
                badge="📚"
                onProgress={(progress) => {
                  setCourseProgress(Math.round(progress));
                }}
              />
            </motion.div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DiscussionBoard
                courseId="blockchain-fundamentals"
                lessonId="lesson-1-1"
                threads={[
                  {
                    id: '1',
                    author: {
                      name: 'Alice Dev',
                      avatar: '👩‍💻',
                      level: 8,
                      badge: '⭐'
                    },
                    title: 'Can someone explain merkle trees in simple terms?',
                    content: 'I understand hashing but merkle trees confuse me. How do they fit together?',
                    createdAt: new Date(Date.now() - 3600000),
                    updatedAt: new Date(Date.now() - 3600000),
                    likes: 12,
                    replies: [
                      {
                        id: 'r1',
                        author: {
                          name: 'Bob Smith',
                          avatar: '👨‍🎓',
                          level: 12,
                          isInstructor: true
                        },
                        content: 'Merkle trees are just a way to combine multiple hashes into a single root hash. Think of it like a pyramid - each pair of hashes gets combined to create a parent hash.',
                        createdAt: new Date(Date.now() - 1800000),
                        likes: 28,
                        isAcceptedAnswer: true
                      }
                    ],
                    isAnswered: true,
                    helpfulCount: 18,
                    category: 'question',
                    tags: ['merkle-trees', 'hashing']
                  },
                  {
                    id: '2',
                    author: {
                      name: 'Charlie Code',
                      avatar: '👨‍💻',
                      level: 5
                    },
                    title: 'Great resource on Proof of Work',
                    content: 'Found this awesome article explaining PoW: https://example.com/pow-explained',
                    createdAt: new Date(Date.now() - 7200000),
                    updatedAt: new Date(Date.now() - 7200000),
                    likes: 32,
                    replies: [],
                    isAnswered: false,
                    helpfulCount: 8,
                    category: 'resource',
                    tags: ['pow', 'consensus']
                  }
                ]}
                onNewThread={(thread) => {
                  void thread;
                }}
              />
            </motion.div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockUserProgress.badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`border ${
                      badge.rarity === 'Epic'
                        ? 'border-purple-400/30 bg-purple-500/5'
                        : badge.rarity === 'Rare'
                          ? 'border-cyan-400/30 bg-cyan-500/5'
                          : 'border-slate-600/30 bg-slate-500/5'
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-3">{badge.icon}</div>
                      <h3 className="font-bold text-white mb-1">{badge.name}</h3>
                      <p className="text-sm text-slate-400 mb-3">{badge.description}</p>
                      <Badge
                        className={`
                          ${
                            badge.rarity === 'Epic'
                              ? 'bg-purple-600 text-purple-100'
                              : badge.rarity === 'Rare'
                                ? 'bg-cyan-600 text-cyan-100'
                                : 'bg-slate-600 text-slate-100'
                          }
                        `}
                      >
                        {badge.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Locked Badges */}
              <div className="mt-12">
                <h3 className="text-lg font-bold text-white mb-4">Locked Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-slate-700 bg-slate-900/30 opacity-50">
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-3 filter grayscale">🚀</div>
                      <h3 className="font-bold text-slate-400 mb-1">Speedster</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Complete 3 lessons in one day
                      </p>
                      <Badge variant="outline" className="border-slate-600 text-slate-500">
                        Locked
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-900/30 opacity-50">
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-3 filter grayscale">🧠</div>
                      <h3 className="font-bold text-slate-400 mb-1">Brain Master</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Score 100% on 5 quizzes
                      </p>
                      <Badge variant="outline" className="border-slate-600 text-slate-500">
                        Locked
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-700 bg-slate-900/30 opacity-50">
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-3 filter grayscale">👑</div>
                      <h3 className="font-bold text-slate-400 mb-1">Legend</h3>
                      <p className="text-sm text-slate-500 mb-3">
                        Reach level 20
                      </p>
                      <Badge variant="outline" className="border-slate-600 text-slate-500">
                        Locked
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
