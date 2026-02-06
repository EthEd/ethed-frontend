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
  ChevronRight,
  ListTodo,
  BookOpen,
  MessageCircle,
  Users,
  Trophy,
  Clock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EnhancedLessonViewer from './EnhancedLessonViewer';
import DiscussionBoard from './DiscussionBoard';

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  lessons: LessonItem[];
  rewardBadge?: string;
  icon?: string;
}

interface LessonItem {
  id: string;
  title: string;
  content: string;
  duration: string;
  type: 'reading' | 'video' | 'quiz' | 'coding' | 'project' | 'discussion';
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keyTakeaways: string[];
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
    passingScore: number;
  };
}

interface CourseModulePageProps {
  courseId: string;
  courseName: string;
  modules: ModuleItem[];
  totalLessons: number;
  badge?: string;
  onProgress?: (progress: number) => void;
}

interface DiscussionThread {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    badge?: string;
  };
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: any[];
  isAnswered: boolean;
  helpfulCount: number;
  category: 'question' | 'discussion' | 'resource' | 'bug-report';
  tags: string[];
  isLiked?: boolean;
}

export default function CourseModulePage({
  courseId,
  courseName,
  modules,
  totalLessons,
  badge,
  onProgress
}: CourseModulePageProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(modules[0] || null);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'lesson' | 'discussion'>('lesson');
  const [discussionThreads, setDiscussionThreads] = useState<DiscussionThread[]>([
    {
      id: '1',
      author: { name: 'Alex Chen', avatar: '👨‍💻', level: 5, badge: '🌟' },
      title: 'What are the differences between ERC-20 and ERC-721?',
      content: 'I\'m trying to understand the key differences between these two standards. Can someone explain?',
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
      likes: 24,
      replies: [
        {
          id: 'r1',
          author: { name: 'Sarah Dev', avatar: '👩‍💻', level: 8, isInstructor: true },
          content: 'ERC-20 is for fungible tokens (all tokens are identical), while ERC-721 is for NFTs (each token is unique).',
          createdAt: new Date(Date.now() - 1800000),
          likes: 45,
          isAcceptedAnswer: true
        }
      ],
      isAnswered: true,
      helpfulCount: 35,
      category: 'question',
      tags: ['standards', 'smart-contracts']
    }
  ]);

  const totalModules = modules.length;
  const completedModules = modules.filter(m =>
    m.lessons.every(l => completedLessons.includes(l.id))
  ).length;
  const progressPercentage = (completedLessons.length / totalLessons) * 100;

  useEffect(() => {
    onProgress?.(progressPercentage);
  }, [progressPercentage, onProgress]);

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => [...new Set([...prev, lessonId])]);
  };

  const handleNewThread = (thread: Partial<DiscussionThread>) => {
    const newThread: DiscussionThread = {
      id: `thread-${Date.now()}`,
      author: { name: 'You', avatar: '👤', level: 1 },
      title: thread.title || '',
      content: thread.content || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: [],
      isAnswered: false,
      helpfulCount: 0,
      category: 'discussion',
      tags: [],
      ...thread
    };
    setDiscussionThreads(prev => [newThread, ...prev]);
  };

  if (!selectedModule) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-slate-400">No modules available</p>
      </div>
    );
  }

  if (selectedLesson && activeTab === 'lesson') {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <button
            onClick={() => setSelectedLesson(null)}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-6"
          >
            ← Back to {selectedModule.title}
          </button>

        <EnhancedLessonViewer
            lesson={{
              id: parseInt(selectedLesson.id.split('-')[2]) || 1,
              title: selectedLesson.title,
              content: selectedLesson.content,
              duration: parseInt(selectedLesson.duration) || 20,
              type: selectedLesson.type as 'reading' | 'video' | 'quiz' | 'coding' | 'project',
              xpReward: selectedLesson.xpReward,
              difficulty: selectedLesson.difficulty === 'Beginner' ? 'Easy' : selectedLesson.difficulty === 'Intermediate' ? 'Medium' : 'Hard',
              keyTakeaways: selectedLesson.keyTakeaways,
              quiz: selectedLesson.quiz ? {
                questions: selectedLesson.quiz.questions.map(q => ({
                  id: parseInt(q.id.replace(/\D/g, '')) || 1,
                  question: q.question,
                  options: q.options,
                  correct: q.correct,
                  explanation: q.explanation
                })),
                passingScore: selectedLesson.quiz.passingScore
              } : undefined
            }}
            courseContext={{
              courseId,
              courseName,
              totalLessons,
              badge: badge || '📚',
              currentModuleIndex: modules.findIndex(m => m.id === selectedModule.id),
              completedLessons: completedLessons.map(id => parseInt(id.split('-')[2]) || 0).filter(id => id > 0)
            }}
            onComplete={() => {
              handleLessonComplete(selectedLesson.id);
              const nextLessonIndex = selectedModule.lessons.findIndex(l => l.id === selectedLesson.id) + 1;
              if (nextLessonIndex < selectedModule.lessons.length) {
                setSelectedLesson(selectedModule.lessons[nextLessonIndex]);
              }
            }}
            onNavigate={(direction) => {
              const currentIndex = selectedModule.lessons.findIndex(l => l.id === selectedLesson.id);
              if (direction === 'next' && currentIndex < selectedModule.lessons.length - 1) {
                setSelectedLesson(selectedModule.lessons[currentIndex + 1]);
              } else if (direction === 'prev' && currentIndex > 0) {
                setSelectedLesson(selectedModule.lessons[currentIndex - 1]);
              }
            }}
          />

          {/* Discussion Section */}
          <div className="mt-12">
            <DiscussionBoard
              courseId={courseId}
              lessonId={selectedLesson.id}
              threads={discussionThreads}
              onNewThread={handleNewThread}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header with Progress */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-b border-slate-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{courseName}</h1>
              <p className="text-slate-400">
                {completedLessons.length} of {totalLessons} lessons completed
              </p>
            </div>
            {badge && <span className="text-4xl">{badge}</span>}
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-sm text-slate-400">
            <span>{Math.round(progressPercentage)}% Complete</span>
            <span>
              {completedModules}/{totalModules} modules finished
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Modules Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-slate-900/50 border-slate-700 sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Course Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {modules.map((module, index) => {
                  const moduleProgress = module.lessons.filter(l =>
                    completedLessons.includes(l.id)
                  ).length / module.lessons.length * 100;

                  return (
                    <motion.button
                      key={module.id}
                      onClick={() => {
                        setSelectedModule(module);
                        setSelectedLesson(null);
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full p-3 rounded-lg text-left transition-all border ${
                        selectedModule.id === module.id
                          ? 'bg-cyan-600/20 border-cyan-400/50'
                          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{module.icon || '📚'}</span>
                        <h3 className="font-medium text-white text-sm truncate">
                          {module.title}
                        </h3>
                      </div>
                      <Progress value={moduleProgress} className="h-1 mb-1" />
                      <p className="text-xs text-slate-400">
                        {module.lessons.filter(l => completedLessons.includes(l.id)).length}/{module.lessons.length} lessons
                      </p>
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Module Header */}
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{selectedModule.icon || '📚'}</span>
                      <Badge className="bg-cyan-600/30 text-cyan-300">Module {modules.findIndex(m => m.id === selectedModule.id) + 1}</Badge>
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {selectedModule.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {selectedModule.description}
                    </CardDescription>
                  </div>
                  {selectedModule.rewardBadge && (
                    <div className="text-center">
                      <span className="text-3xl mb-1 block">{selectedModule.rewardBadge}</span>
                      <p className="text-xs text-slate-400">Module Badge</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedModule.estimatedTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    {selectedModule.lessons.length} lessons
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {selectedModule.lessons.reduce((sum, l) => sum + l.xpReward, 0)} XP
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Lessons</h2>
              <AnimatePresence>
                {selectedModule.lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        onClick={() => setSelectedLesson(lesson)}
                        className={`cursor-pointer transition-all border ${
                          isCompleted
                            ? 'bg-slate-900/60 border-emerald-400/30 hover:border-emerald-400/50'
                            : 'bg-slate-900/60 border-slate-700 hover:border-cyan-400/50'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isCompleted && (
                                  <span className="text-emerald-400">✓</span>
                                )}
                                <span className="text-lg">
                                  {lesson.type === 'reading' && '📖'}
                                  {lesson.type === 'video' && '🎥'}
                                  {lesson.type === 'quiz' && '📝'}
                                  {lesson.type === 'coding' && '💻'}
                                  {lesson.type === 'project' && '🚀'}
                                  {lesson.type === 'discussion' && '💬'}
                                </span>
                                <h3 className={`font-semibold text-sm ${
                                  isCompleted ? 'text-slate-300 line-through' : 'text-white'
                                }`}>
                                  Lesson {index + 1}: {lesson.title}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-400 ml-6">
                                {lesson.duration} • {lesson.difficulty} • +{lesson.xpReward} XP
                              </p>
                            </div>
                            <motion.div
                              animate={{ x: 0 }}
                              whileHover={{ x: 4 }}
                            >
                              <ChevronRight className="h-5 w-5 text-slate-400" />
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
