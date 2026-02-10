'use client';

import React from 'react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useClaimNFT } from '@/hooks/use-claim-nft';
import Link from 'next/link';
import { ArrowRight, Play, FileText, Code, CheckCircle, Clock, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'motion/react';

const courseModules = [
  { id: 1, title: 'Introduction to 0G', type: 'video', duration: '15 min', description: 'Learn what makes 0G the first AI-native blockchain' },
  { id: 2, title: 'Storage Architecture', type: 'text', duration: '20 min', description: 'Understand how 0G achieves massive scale storage' },
  { id: 3, title: 'Compute and Inference', type: 'text', duration: '18 min', description: 'Explore 0G\'s decentralized compute marketplace' },
  { id: 4, title: 'Settlement and Coordination', type: 'text', duration: '22 min', description: 'Learn how 0G\'s EVM-compatible settlement layer works' },
  { id: 5, title: 'Inference via the Broker', type: 'text', duration: '20 min', description: 'Master the 0G Inference Broker - your gateway to decentralized AI' },
  { id: 6, title: 'Security and Integrity', type: 'text', duration: '25 min', description: 'Understand 0G\'s multi-layered security model' },
  { id: 7, title: 'Lab A: First File Up and Back', type: 'code', duration: '30 min', description: 'Upload your first file to 0G storage and retrieve it' },
  { id: 8, title: 'Lab B: AI Model Storage', type: 'code', duration: '45 min', description: 'Store a machine learning model on 0G and load it for inference' },
  { id: 9, title: 'Lab C: Decentralized Inference', type: 'code', duration: '40 min', description: 'Run AI inference through the 0G compute network' },
  { id: 10, title: 'Capstone: AI-Powered DApp', type: 'text', duration: '2 hours', description: 'Build a complete decentralized application using the full 0G stack' }
];

export default function ZeroGCoursePage() {
  const { completedModules, completionCount, percent } = useCourseProgress('0g-101', courseModules.length);
  const { claimNFT, isClaiming, claimed } = useClaimNFT();
  const completionPercentage = percent;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Course Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="h-4 w-4" />
            AI-Native Blockchain
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-6 leading-tight">
            0G 101: AI-Native Stack
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Master 0G&apos;s AI-native stack. Store and retrieve data, call the decentralized Compute Network 
            for LLM inference, and record verifiable outputs on-chain in a single, working dApp! 🚀
          </p>

          <div className="flex items-center justify-center gap-8 text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>6 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Beginner Friendly</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>0G Expert NFT</span>
            </div>
          </div>

          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-4 text-lg rounded-lg">
            <Link href="/courses/0g-101/lesson/1" className="flex items-center gap-2">
              Start Learning
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border-emerald-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-300">
                  Completed: <span className="text-green-300">{completionCount}/{courseModules.length}</span>
                </span>
                <span className="text-slate-300">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              
              {completionPercentage === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-yellow-400" />
                    <div>
                      <h3 className="text-green-300 font-bold">Congratulations! 🎉</h3>
                      <p className="text-slate-300 text-sm">You&apos;ve completed the 0G 101 course!</p>
                    </div>
                  </div>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    onClick={() => claimNFT('0g-101')}
                    disabled={isClaiming || claimed}
                  >
                    {claimed ? 'NFT Claimed!' : isClaiming ? 'Claiming...' : 'Claim Your NFT Certificate'}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Modules */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8">Course Modules</h2>
          
          <div className="grid gap-6">
            {courseModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold">
                          {module.id}
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl">{module.title}</CardTitle>
                          <CardDescription className="text-slate-400 mt-1">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                          module.type === 'video' ? 'border-emerald-400/40 text-emerald-300' :
                          module.type === 'code' ? 'border-cyan-400/40 text-cyan-300' :
                          'border-purple-400/40 text-purple-300'
                        }`}>
                          {module.type === 'video' && <Play className="inline h-3 w-3 mr-1" />}
                          {module.type === 'code' && <Code className="inline h-3 w-3 mr-1" />}
                          {module.type === 'text' && <FileText className="inline h-3 w-3 mr-1" />}
                          {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                        
                        {completedModules.has(module.id) && (
                          <CheckCircle className="h-6 w-6 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Link href={`/courses/0g-101/lesson/${module.id}`}>
                      <Button 
                        variant="outline" 
                        className="w-full border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 hover:border-emerald-400"
                      >
                        {completedModules.has(module.id) ? 'Review Module' : 'Start Module'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Course Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What You&apos;ll Build</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border-emerald-400/20">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center gap-2">
                  <Code className="h-6 w-6" />
                  Storage & Retrieval
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Build apps that store and retrieve data using 0G&apos;s decentralized storage network with massive scale.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900/50 to-slate-900/50 border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-cyan-300 flex items-center gap-2">
                  <Play className="h-6 w-6" />
                  AI Inference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Create AI-powered dApps that use 0G&apos;s compute network for decentralized LLM inference.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border-purple-400/20">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  Verifiable Outputs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Record AI outputs on-chain with verifiable proof, building trust in your AI-native applications.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}