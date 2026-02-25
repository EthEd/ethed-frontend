'use client';

import React from 'react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useClaimNFT } from '@/hooks/use-claim-nft';
import { ArrowLeft, Play, FileText, Code, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'motion/react';

const courseModules = [
  {
    id: 1,
    title: 'What is ENS?',
    description: 'Intro to Ethereum Name Service and why it matters',
    duration: '8 min',
    type: 'video',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/1kQ4hQG4Fqg',
  },
  {
    id: 2,
    title: 'Registering Your First ENS Name',
    description: 'Step-by-step guide to registering a .eth name',
    duration: '12 min',
    type: 'text',
    completed: false,
    content: `
# Registering Your First ENS Name

ENS makes it easy to get a human-readable name for your Ethereum address.\n\n## Steps\n1. Go to [app.ens.domains](https://app.ens.domains)\n2. Connect your wallet\n3. Search for your desired .eth name\n4. Register and pay the fee\n\n**Tip:** Choose a name that represents you or your project!\n\n## Why Register?\n- Easier to share your address\n- Use with dApps\n- Build your Web3 identity\n    `
  },
  {
    id: 3,
    title: 'Integrating ENS in dApps',
    description: 'How to resolve ENS names in your app using ethers.js',
    duration: '15 min',
    type: 'code',
    completed: false,
    code: `// ENS resolution example with ethers.js\nimport { ethers } from 'ethers';\nconst provider = new ethers.JsonRpcProvider();\nconst address = await provider.resolveName('vitalik.eth');\nconsole.log(address); // 0xd8dA...` 
  },
  {
    id: 4,
    title: 'Quiz: ENS Basics',
    description: 'Test your knowledge of ENS concepts',
    duration: '10 min',
    type: 'quiz',
    completed: false,
    quiz: {
      question: 'What is the main benefit of ENS?',
      options: [
        'Cheaper gas fees',
        'Human-readable names for addresses',
        'Faster transactions',
        'Private messaging'
      ],
      answer: 1
    }
  }
];

export default function ENS101Course() {
  const { completedModules, completionCount, percent } = useCourseProgress('ens-101', courseModules.length);
  const { claimNFT, isClaiming, claimed } = useClaimNFT();
  const completionPercentage = percent;

  const handleModuleClick = (moduleId: number) => {
    window.location.href = `/courses/ens-101/lesson/${moduleId}`;
  };

  return (
    <div className="bg-background relative w-full overflow-hidden min-h-screen">
      <div className="absolute inset-0 z-0">
        <div className="from-purple-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-cyan-300/5 absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            className="mb-4 text-cyan-400 hover:text-cyan-300"
            onClick={() => window.location.href = '/learn'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                ENS 101: Ethereum Name Service Essentials
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Learn how ENS works, register names, integrate with dApps, and build ENS-powered apps.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  4 Modules
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  2 Hours
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  ENS Pro NFT
                </div>
              </div>
            </div>
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
                    onClick={() => claimNFT('ens-101')}
                    disabled={isClaiming || claimed}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    {claimed ? 'NFT Claimed!' : isClaiming ? 'Claiming...' : 'Claim NFT Badge'}
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
                    <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-purple-300">ENS Pro NFT</p>
                    <p className="text-xs text-slate-400">Complete course to unlock</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
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
            let icon = <FileText className="h-6 w-6 text-cyan-400" />;
            if (module.type === 'video') icon = <Play className="h-6 w-6 text-purple-400" />;
            if (module.type === 'code') icon = <Code className="h-6 w-6 text-emerald-400" />;
            if (module.type === 'quiz') icon = <Award className="h-6 w-6 text-yellow-400" />;
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
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${
                          isCompleted ? 'text-emerald-300' : 
                          isAvailable ? 'text-white' : 'text-slate-500'
                        }`}>
                          Module {module.id}: {module.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full border text-sm font-medium ${
                            module.type === 'video' 
                              ? 'border-purple-400/40 text-purple-300' 
                              : module.type === 'code'
                              ? 'border-emerald-400/40 text-emerald-300'
                              : module.type === 'quiz'
                              ? 'border-yellow-400/40 text-yellow-300'
                              : 'border-cyan-400/40 text-cyan-300'
                          }`}>
                            {module.type.charAt(0).toUpperCase() + module.type.slice(1)}
                          </span>
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
      </div>
    </div>
  );
}
