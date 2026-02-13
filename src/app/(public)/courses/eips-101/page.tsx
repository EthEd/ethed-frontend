'use client';

import React from 'react';
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle, Play, FileText, LayoutDashboard, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

const courseModules = [
  {
    id: 1,
    title: 'EIPs 101 — Intro (Video)',
    description: 'Introductory course overview video',
    duration: '10 min',
    type: 'video',
    completed: false,
    content: '/EIPs101.md#1-ethereum-in-plain-language'
  },
  {
    id: 2,
    title: 'What is an EIP?',
    description: 'The structure and purpose of Ethereum Improvement Proposals',
    duration: '10 min',
    type: 'reading',
    completed: false,
    content: '/EIPs101.md#2-what-is-an-eip'
  },
  {
    id: 3,
    title: 'Types of EIPs',
    description: 'Standards Track, Meta, and Informational EIPs explained',
    duration: '12 min',
    type: 'reading',
    completed: false,
    content: '/EIPs101.md#3-the-kinds-of-eips'
  },
  {
    id: 4,
    title: 'EIP Lifecycle',
    description: 'How ideas become standards through the review process',
    duration: '18 min',
    type: 'reading',
    completed: false,
    content: '/EIPs101.md#4-the-lifecycle-how-an-idea-becomes-a-standard'
  },
  {
    id: 5,
    title: 'Anatomy of an EIP',
    description: 'Structure and components of a well-written proposal',
    duration: '20 min',
    type: 'reading',
    completed: false,
    content: '/EIPs101.md#5-anatomy-of-an-eip-with-a-guided-example'
  },
  {
    id: 6,
    title: 'Famous EIP Case Studies',
    description: 'Analyzing ERC-20, ERC-721, EIP-1559, and EIP-4844',
    duration: '25 min',
    type: 'reading',
    completed: false,
    content: '/EIPs101.md#7-case-studies-that-make-eips-intuitive'
  },
  {
    id: 7,
    title: 'Reading EIPs Like a Pro',
    description: 'Techniques for efficiently understanding complex proposals',
    duration: '15 min',
    type: 'reading',
    completed: false,
    content: '/EIPs101.md#6-reading-real-eips-without-headaches'
  },
  {
    id: 8,
    title: 'Draft Your First EIP',
    description: 'Hands-on workshop using EIPsInsight Proposal Builder',
    duration: '45 min',
    type: 'interactive',
    completed: false,
    content: '/EIPs101.md#9-drafting-a-first-eip-with-eipsinsights-proposal-builder'
  },
  {
    id: 9,
    title: 'Final Quiz — Mint NFT',
    description: 'Complete a short quiz to mint your EIP Expert NFT',
    duration: '10 min',
    type: 'quiz',
    completed: false,
    content: '/EIPs101.md#10-final-quiz'
  }
];

import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useClaimNFT } from '@/hooks/use-claim-nft';

export default function EIPs101Course() {
  const { completedModules, completionCount, percent } = useCourseProgress('eips-101', courseModules.length);
  const completionPercentage = percent;
  const { claimNFT, isClaiming, claimed } = useClaimNFT();

  const handleModuleClick = (moduleId: number) => {
    // Navigate to the lesson viewer with the module ID
    window.location.href = `/courses/eips-101/lesson/${moduleId}`;
  };

  return (
    <div className="bg-background relative w-full overflow-hidden min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 z-0">
        <div className="from-purple-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-cyan-300/5 absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-cyan-400 transition-colors">
              Courses
            </Link>
            <span>/</span>
            <span className="text-slate-300">EIPs 101</span>
          </div>
          <Link href="/profile" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            className="mb-4 text-cyan-400 hover:text-cyan-300"
            onClick={() => window.location.href = '/courses'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                EIPs 101: From First Principles to First Proposal
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Master Ethereum Improvement Proposals from basics to writing your first EIP using EIPsInsight&apos;s tools.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-400/20">
                  Beginner Friendly
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-300 border-emerald-400/20">
                  2-3 Hours
                </Badge>
                <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-300 border-cyan-400/20">
                  Free Course
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  8 Modules
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  2-3 Hours
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  EIP Expert NFT
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <Card className="lg:w-80 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-300">Your Progress</CardTitle>
                <CardDescription>Complete all modules to earn your NFT badge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-cyan-300">{completionCount}/{courseModules.length}</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                
                {completionPercentage === 100 ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => claimNFT('eips-101')}
                    disabled={isClaiming || claimed}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    {claimed ? 'NFT Claimed!' : isClaiming ? 'Claiming...' : 'Claim NFT Badge'}
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
                    <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-purple-300">EIP Expert NFT</p>
                    <p className="text-xs text-slate-400">Complete course to unlock</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Course Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-4"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Course Modules</h2>
          
            {courseModules.map((module, index) => {
            const isCompleted = completedModules.has(module.id);
            const isAvailable = index === 0 || completedModules.has(courseModules[index - 1].id);
            
            return (
              <Card 
                key={module.id}
                className={`
                  transition-all duration-300 cursor-pointer
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border-emerald-400/40' 
                    : isAvailable
                    ? 'bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-cyan-400/20 hover:border-cyan-400/40'
                    : 'bg-gradient-to-r from-slate-900/30 to-slate-800/30 border-slate-600/20 opacity-60'
                  }
                `}
                onClick={() => isAvailable && handleModuleClick(module.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-emerald-400" />
                      ) : isAvailable ? (
                        module.type === 'reading' ? (
                          <FileText className="h-6 w-6 text-cyan-400" />
                        ) : (
                          <Play className="h-6 w-6 text-purple-400" />
                        )
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-600 border border-slate-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${
                          isCompleted ? 'text-emerald-300' : 
                          isAvailable ? 'text-white' : 'text-slate-500'
                        }`}>
                          Module {module.id}: {module.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`
                            ${module.type === 'reading' 
                              ? 'border-cyan-400/40 text-cyan-300' 
                              : 'border-purple-400/40 text-purple-300'
                            }
                          `}>
                            {module.type === 'reading' ? 'Reading' : 'Interactive'}
                          </Badge>
                          <span className={`text-sm ${
                            isAvailable ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {module.duration}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${
                        isAvailable ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {module.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Course Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid md:grid-cols-2 gap-8"
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-cyan-300">What You&apos;ll Learn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Understand the EIP process from ideation to implementation</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Read and analyze real EIPs like ERC-20, EIP-1559, and EIP-4844</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Draft your first EIP using EIPsInsight&apos;s Proposal Builder</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Contribute to Ethereum&apos;s development through proposals</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-lg text-purple-300">Prerequisites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Basic understanding of blockchain concepts</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Familiarity with Ethereum (helpful but not required)</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Interest in technical standards and governance</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}