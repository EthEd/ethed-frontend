'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Zap, BookOpen, BarChart3, Trophy, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Lesson {
  id: number;
  title: string;
  content: string;
  duration: number;
  type: 'reading' | 'video' | 'quiz' | 'coding' | 'project';
  xpReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  keyTakeaways: string[];
  quiz?: {
    questions: Array<{
      id: number;
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
    passingScore: number; // percentage
  };
}

interface CourseContext {
  courseId: string;
  courseName: string;
  totalLessons: number;
  badge: string;
  currentModuleIndex: number;
  completedLessons: number[];
}

interface EnhancedLessonViewerProps {
  lesson: Lesson;
  courseContext: CourseContext;
  onComplete: (lessonId: number, xpEarned: number) => void;
  onNavigate: (direction: 'next' | 'prev') => void;
}

export default function EnhancedLessonViewer({
  lesson,
  courseContext,
  onComplete,
  onNavigate
}: EnhancedLessonViewerProps) {
  const [isCompleted, setIsCompleted] = useState(courseContext.completedLessons.includes(lesson.id));
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const lessonProgress = ((courseContext.completedLessons.length + (isCompleted ? 0 : 1)) / courseContext.totalLessons) * 100;
  const courseProgress = (courseContext.completedLessons.length / courseContext.totalLessons) * 100;

  const handleMarkComplete = () => {
    setIsCompleted(true);
    setShowCelebration(true);
    onComplete(lesson.id, lesson.xpReward);
    toast.success(`${lesson.xpReward} XP earned! 🎉`);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleQuizSubmit = () => {
    if (!lesson.quiz) return;
    
    let correct = 0;
    lesson.quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });

    const score = (correct / lesson.quiz.questions.length) * 100;
    setQuizScore(score);

    if (score >= lesson.quiz.passingScore) {
      toast.success(`Quiz passed with ${Math.round(score)}%! ✨`);
      setTimeout(() => setShowQuiz(false), 1500);
    } else {
      toast.error(`Score: ${Math.round(score)}%. Try again!`);
    }
  };

  const milestoneReached = isCompleted && courseProgress >= 50 && courseProgress < 75;
  const nearCompletion = isCompleted && courseProgress >= 75;

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="from-cyan-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Top Navigation Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-slate-900/50 backdrop-blur-xl border border-cyan-400/20 rounded-2xl sticky top-0 z-50"
        >
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              className="text-cyan-400 hover:text-cyan-300"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-yellow-300">{lesson.xpReward} XP</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">
                Lesson {courseContext.completedLessons.length + 1} of {courseContext.totalLessons}
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(courseProgress)}%</span>
            </div>
            <Progress value={courseProgress} className="h-2" />
          </div>
        </motion.div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <Card className="bg-gradient-to-r from-emerald-600 to-cyan-600 border-0 p-8">
                <div className="text-center">
                  <Trophy className="h-16 w-16 text-yellow-300 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-2xl font-bold text-white mb-2">Lesson Complete!</h2>
                  <p className="text-white/90">+{lesson.xpReward} XP</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-400/20 mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`
                      ${lesson.type === 'reading' ? 'bg-blue-500/20 text-blue-300' : 
                        lesson.type === 'video' ? 'bg-purple-500/20 text-purple-300' :
                        lesson.type === 'quiz' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-cyan-500/20 text-cyan-300'}
                    `}>
                      {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-slate-400">
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration} min
                    </Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3">
                    {lesson.title}
                  </h1>
                  <p className="text-lg text-slate-300">
                    Part of {courseContext.courseName}
                  </p>
                </div>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle className="h-12 w-12 text-emerald-400" />
                  </motion.div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pb-8">
              {/* Key Takeaways */}
              <div className="bg-slate-950/40 border border-cyan-400/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {lesson.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-cyan-300">{idx + 1}</span>
                      </div>
                      <span className="text-slate-300">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lesson Content */}
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {lesson.content}
                </div>
              </div>

              {/* Quiz Section */}
              {lesson.quiz && !showQuiz && !quizScore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-yellow-300 mb-3">Knowledge Check</h3>
                  <p className="text-slate-300 mb-4">Test your understanding of this lesson's concepts</p>
                  <Button 
                    onClick={() => setShowQuiz(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Take Quiz ({lesson.quiz.questions.length} questions)
                  </Button>
                </motion.div>
              )}

              {/* Quiz Display */}
              {showQuiz && lesson.quiz && !quizScore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 bg-slate-950/40 border border-yellow-400/20 rounded-xl p-6"
                >
                  <h3 className="text-2xl font-bold text-white">Knowledge Check Quiz</h3>
                  {lesson.quiz.questions.map((question, idx) => (
                    <div key={question.id} className="space-y-3 p-4 bg-slate-900/40 rounded-lg">
                      <p className="font-semibold text-white">Question {idx + 1}: {question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optIdx) => (
                          <label key={optIdx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={quizAnswers[question.id] === optIdx}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [question.id]: optIdx })}
                              className="w-4 h-4"
                            />
                            <span className="text-slate-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button 
                    onClick={handleQuizSubmit}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Submit Quiz
                  </Button>
                </motion.div>
              )}

              {/* Quiz Results */}
              {quizScore !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-xl border ${
                    quizScore >= 80 
                      ? 'bg-emerald-500/10 border-emerald-400/30' 
                      : 'bg-orange-500/10 border-orange-400/30'
                  }`}
                >
                  <div className="text-center">
                    <h3 className={`text-2xl font-bold mb-2 ${
                      quizScore >= 80 ? 'text-emerald-300' : 'text-orange-300'
                    }`}>
                      {quizScore >= 80 ? 'Quiz Passed! ✅' : 'Almost There! Try Again'}
                    </h3>
                    <p className="text-4xl font-bold mb-2 text-white">{Math.round(quizScore)}%</p>
                    <p className="text-slate-300 mb-4">
                      {quizScore >= 80 
                        ? 'Great job! You\'ve mastered this lesson.' 
                        : `You need ${lesson.quiz?.passingScore || 80}% to pass. Review and try again!`}
                    </p>
                    {quizScore >= 80 && (
                      <Button 
                        onClick={() => setQuizScore(null)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Continue
                      </Button>
                    )}
                    {quizScore < 80 && (
                      <Button 
                        onClick={() => {
                          setShowQuiz(true);
                          setQuizScore(null);
                          setQuizAnswers({});
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Retake Quiz
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Notes Section */}
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📝 Personal Notes</h3>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Jot down your thoughts and insights..."
                  className="w-full h-32 bg-slate-950/40 border border-slate-700 rounded-lg p-4 text-slate-300 placeholder-slate-600 focus:border-cyan-400/50 focus:outline-none"
                />
              </div>

              {/* Completion Button */}
              {isCompleted ? (
                <div className="text-center text-emerald-300 font-medium">Completed</div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center gap-4 mt-8"
        >
          <Button 
            variant="outline" 
            onClick={() => onNavigate('prev')}
            className="border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Lesson
          </Button>

          <div className="text-center text-slate-400 text-sm">
            <BookOpen className="inline mr-2 h-4 w-4" />
            Lesson {courseContext.completedLessons.length + 1} of {courseContext.totalLessons}
          </div>

          <Button 
            onClick={() => {
              if (!isCompleted) handleMarkComplete();
              onNavigate('next');
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
          >
            Next Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* Milestone Celebration */}
        <AnimatePresence>
          {milestoneReached && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-center"
            >
              <Award className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">🎉 Milestone Reached!</h3>
              <p className="text-white/90">You're 50% through the course! Keep it up!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
