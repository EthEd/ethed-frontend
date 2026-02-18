'use client';

import React, { useState } from 'react';
import { ArrowRight, Clock, Star, Users, Award, Lock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { coursesWithPath, learningPaths, canAccessCourse } from '@/lib/courseData';

// Mock completed courses - in real app, would come from user session/DB
const mockCompletedCourses = ['eips-101'];

// Deterministic pseudo-random generator based on course id so server/client match.
// Returns an object `{ students, rating }` stable across renders.
function deterministicStats(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  const students = Math.abs(h) % 3000 + 100;
  const rating = (4.5 + (Math.abs(h) % 40) / 100).toFixed(1);
  return { students, rating };
}

const courses = coursesWithPath.map(c => ({
  id: c.id,
  title: c.title,
  description: c.description,
  level: c.level,
  duration: c.modules.reduce((acc, m) => {
    const match = m.estimatedTime.match(/(\d+)/);
    return acc + (match ? parseInt(match[0]) : 0);
  }, 0) + ' hours',
  ...deterministicStats(c.id),
  price: 'Free',
  badge: c.badge,
  topics: c.skillsGained,
  href: `/courses/${c.id}`,
  available: c.id === 'eips-101' || c.id === 'ens-101' || c.id === '0g-101',
  prerequisites: c.prerequisites,
  learningPath: learningPaths.Fundamentals.courses.includes(c.id) ? 'Fundamentals' :
                learningPaths.Infrastructure.courses.includes(c.id) ? 'Infrastructure' :
                learningPaths.Development.courses.includes(c.id) ? 'Development' : 'Other',
  difficultyMilestones: c.difficultyMilestones,
  modules: c.modules,
  nextRecommendedCourse: c.nextRecommendedCourse
}));



const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const
    }
  },
};

export default function CoursesPage() {
  const [selectedPath, setSelectedPath] = useState<'all' | 'Fundamentals' | 'Infrastructure' | 'Development'>('all');

  const availableCourses = courses.filter(course => course.available);
  const comingSoonCourses = courses.filter(course => !course.available);

  const filteredCourses = selectedPath === 'all' 
    ? availableCourses 
    : availableCourses.filter(c => c.learningPath === selectedPath);

  return (
    <div className="bg-background relative w-full overflow-hidden min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="from-emerald-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-cyan-300/5 absolute top-0 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Master Web3 & Blockchain
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Learn blockchain fundamentals, smart contracts, DeFi, and more. Earn verifiable NFT credentials as you progress through hands-on courses.
          </p>
        </motion.div>

        {/* Learning Paths Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Choose Your Learning Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { id: 'Fundamentals', icon: '📚', title: 'Fundamentals', description: 'Start your Web3 journey', color: 'from-cyan-600 to-blue-600' },
              { id: 'Infrastructure', icon: '⚙️', title: 'Infrastructure', description: 'Build the backbone', color: 'from-emerald-600 to-teal-600' },
              { id: 'Development', icon: '💻', title: 'Development', description: 'Create advanced systems', color: 'from-purple-600 to-pink-600' }
            ].map((path) => (
              <motion.button
                key={path.id}
                onClick={() => setSelectedPath(path.id as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPath === path.id
                    ? `border-${path.color.split('-')[1]}-400 bg-gradient-to-br ${path.color}`
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className={`text-3xl mb-2 ${selectedPath === path.id ? 'scale-110' : ''}`}>
                  {path.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{path.title}</h3>
                <p className={`text-sm ${selectedPath === path.id ? 'text-white' : 'text-slate-400'}`}>
                  {path.description}
                </p>
              </motion.button>
            ))}
            <motion.button
              onClick={() => setSelectedPath('all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 transition-all text-left md:col-span-3 lg:col-span-1 ${
                selectedPath === 'all'
                  ? 'border-cyan-400 bg-gradient-to-br from-cyan-600/50 to-purple-600/50'
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <div className={`text-3xl mb-2 ${selectedPath === 'all' ? 'scale-110' : ''}`}>
                🎯
              </div>
              <h3 className="font-bold text-white mb-1">All Courses</h3>
              <p className={`text-sm ${selectedPath === 'all' ? 'text-white' : 'text-slate-400'}`}>
                Browse everything
              </p>
            </motion.button>
          </div>
        </motion.section>

        {/* Available Courses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            {selectedPath === 'all' ? 'Available Courses' : `${selectedPath} Path`}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const canAccess = canAccessCourse(course.id, mockCompletedCourses);
              
              return (
                <motion.div key={course.id} variants={cardVariants}>
                  <Card className={`h-full transition-all duration-300 group relative overflow-hidden ${
                    canAccess.canAccess
                      ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20 hover:border-emerald-400/40'
                      : 'bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-slate-600/20 opacity-75'
                  }`}>
                    {/* Prerequisite Lock Overlay */}
                    {!canAccess.canAccess && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-300 font-medium">Locked</p>
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                          canAccess.canAccess
                            ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                            : 'bg-slate-700/50 text-slate-400 border-slate-600/20'
                        }`}>
                          {course.level}
                        </span>
                        <Badge className="bg-cyan-600/40 text-cyan-300 border-cyan-400/30">
                          {course.learningPath}
                        </Badge>
                        <span className={`text-xs font-bold ${canAccess.canAccess ? 'text-cyan-400' : 'text-slate-500'}`}>
                          {course.price}
                        </span>
                      </div>
                      <CardTitle className={`text-xl group-hover:text-cyan-300 transition-colors ${
                        canAccess.canAccess ? 'text-white' : 'text-slate-300'
                      }`}>
                        {course.title}
                      </CardTitle>
                      <CardDescription className={canAccess.canAccess ? 'text-slate-400' : 'text-slate-500'}>
                        {course.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Prerequisites Badge */}
                      {course.prerequisites.length > 0 && (
                        <div className={`p-2 rounded-lg border ${
                          canAccess.canAccess
                            ? 'bg-cyan-500/10 border-cyan-400/30'
                            : 'bg-red-500/10 border-red-400/30'
                        }`}>
                          <p className={`text-xs font-semibold mb-1 ${
                            canAccess.canAccess ? 'text-cyan-300' : 'text-red-300'
                          }`}>
                            Prerequisites:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map((prereq) => (
                              <Badge
                                key={prereq.courseId}
                                variant="outline"
                                className={`text-xs ${
                                  mockCompletedCourses.includes(prereq.courseId)
                                    ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300'
                                    : 'border-orange-400/50 bg-orange-500/10 text-orange-300'
                                }`}
                              >
                                {mockCompletedCourses.includes(prereq.courseId) && '✓ '}
                                {prereq.courseName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className={`flex items-center gap-4 text-sm ${
                        canAccess.canAccess ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${canAccess.canAccess ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'}`} />
                          {course.rating}
                        </div>
                      </div>

                      {/* Badge */}
                      <div className={`flex items-center gap-2 p-2 rounded-lg border ${
                        canAccess.canAccess
                          ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/20'
                          : 'bg-slate-800/50 border-slate-600/20'
                      }`}>
                        <Award className={`h-4 w-4 ${canAccess.canAccess ? 'text-purple-400' : 'text-slate-500'}`} />
                        <span className={`text-sm ${canAccess.canAccess ? 'text-purple-300' : 'text-slate-400'}`}>
                          {course.badge}
                        </span>
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1">
                        {course.topics.slice(0, 3).map((topic) => (
                          <span key={topic} className={`text-xs px-2 py-1 rounded ${
                            canAccess.canAccess
                              ? 'bg-slate-700/50 text-slate-300'
                              : 'bg-slate-800/30 text-slate-500'
                          }`}>
                            {topic}
                          </span>
                        ))}
                        {course.topics.length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            canAccess.canAccess
                              ? 'bg-slate-700/50 text-slate-300'
                              : 'bg-slate-800/30 text-slate-500'
                          }`}>
                            +{course.topics.length - 3}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      {canAccess.canAccess ? (
                        <Button 
                          className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-semibold transition-all duration-300"
                          onClick={() => window.location.href = course.href}
                        >
                          Start Course
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            disabled
                            className="w-full bg-slate-700/50 text-slate-400 cursor-not-allowed"
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Complete Prerequisites
                          </Button>
                          <p className="text-xs text-slate-500 text-center">
                            Complete the course{canAccess.missingPrerequisites.length > 1 ? 's' : ''} above to unlock
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Coming Soon Courses */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-2">
            <Flame className="h-6 w-6 text-orange-400" />
            Coming Soon
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonCourses.map((course) => (
              <motion.div key={course.id} variants={cardVariants}>
                <Card className="h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-600/20 opacity-75">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <span className="text-xs font-medium px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full border border-slate-600/20">
                        {course.level}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{course.price}</span>
                    </div>
                    <CardTitle className="text-xl text-slate-300">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {course.rating}
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-600/20">
                      <Award className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-400">{course.badge}</span>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1">
                      {course.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="text-xs px-2 py-1 bg-slate-800/50 text-slate-500 rounded">
                          {topic}
                        </span>
                      ))}
                      {course.topics.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-slate-800/50 text-slate-500 rounded">
                          +{course.topics.length - 3}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <Button 
                      disabled
                      className="w-full bg-slate-700/50 text-slate-400 cursor-not-allowed"
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}