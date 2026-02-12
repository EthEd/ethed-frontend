'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, HelpCircle, Clock, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

const modules = [
  {
    id: 1,
    type: 'video',
    title: 'What is ENS?',
    duration: '8 min',
    videoUrl: 'https://www.youtube.com/embed/KWoECO_EBkc',
    description: 'Intro to Ethereum Name Service and why it matters',
  },
  {
    id: 2,
    type: 'text',
    title: 'Registering Your First ENS Name',
    duration: '12 min',
    content: `# Registering Your First ENS Name

ENS makes it easy to get a human-readable name for your Ethereum address.

## Steps to Register

1. Go to app.ens.domains
2. Connect your wallet
3. Search for your desired .eth name
4. Register and pay the fee

**Tip:** Choose a name that represents you or your project!

## Why Register?

- Easier to share your address
- Use with dApps  
- Build your Web3 identity

> Remember: Your ENS name is your digital identity in Web3!`,
    description: 'Step-by-step guide to registering a .eth name',
  },
  {
    id: 3,
    type: 'code',
    title: 'Integrating ENS in dApps',
    duration: '15 min',
    code: `// ENS resolution example with ethers.js
import { ethers } from 'ethers';

// Create provider
const provider = new ethers.JsonRpcProvider();

// Resolve ENS name to address
const address = await provider.resolveName('vitalik.eth');
console.log(address); // 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

// Reverse lookup - address to ENS name
const ensName = await provider.lookupAddress(address);
console.log(ensName); // vitalik.eth`,
    description: 'How to resolve ENS names in your app using ethers.js',
  },
  {
    id: 4,
    type: 'quiz',
    title: 'Quiz: ENS Basics',
    duration: '10 min',
    quiz: {
      question: 'What is the main benefit of ENS?',
      options: [
        'Cheaper gas fees',
        'Human-readable names for addresses',
        'Faster transactions',
        'Private messaging'
      ],
      answer: 1
    },
    description: 'Test your knowledge of ENS concepts',
  }
];

interface ENSLessonClientProps {
  lessonId: string;
}

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export default function ENSLessonClient({ lessonId }: ENSLessonClientProps) {
  const router = useRouter();
  const moduleId = parseInt(lessonId);
  const currentModule = modules.find(m => m.id === moduleId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const { completedModules, completionCount, markModuleComplete } = useCourseProgress('ens-101', modules.length);

  const finishCourseBackend = async () => {
    try {
      const res = await fetch('/api/user/course/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: 'ens-101' })
      });
      if (res.ok) toast.success('Course completed! 🎉');
      try { router.refresh(); } catch (e) {}
    } catch (err) {
      // finish course API error — silently handled
    }
  };

  const markAsCompleted = () => {
    if (completedModules.has(moduleId)) return;
    markModuleComplete(moduleId);

    const newCount = completionCount + 1;
    if (newCount === modules.length) {
      finishCourseBackend();
    } else {
      try {
        fetch('/api/user/course/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseSlug: 'ens-101', completedCount: newCount, totalModules: modules.length })
        });
      } catch (err) { /* ignore */ }
    }
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button onClick={() => window.location.href = '/courses/ens-101'}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const renderTextContent = (content: string) => {
    return content.split('\n').map((line: string, i: number) => {
      // Main headings - standardized size
      if (line.startsWith('# ')) return (
        <h1 key={i} className="text-3xl font-bold text-white mb-6 mt-0 leading-tight">
          {line.slice(2)}
        </h1>
      );
      
      // Section headings - cyan color for hierarchy
      if (line.startsWith('## ')) return (
        <h2 key={i} className="text-2xl font-semibold text-cyan-300 mb-4 mt-6 leading-tight">
          {line.slice(3)}
        </h2>
      );
      
      // Subsection headings - emerald for further hierarchy
      if (line.startsWith('### ')) return (
        <h3 key={i} className="text-xl font-semibold text-emerald-300 mb-3 mt-4 leading-snug">
          {line.slice(4)}
        </h3>
      );

      // Bullet points with proper spacing
      if (line.startsWith('- ')) return (
        <div key={i} className="ml-6 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-3 flex-shrink-0"></div>
            <p className="text-lg text-slate-300 leading-relaxed">{line.slice(2)}</p>
          </div>
        </div>
      );

      // Numbered lists
      if (line.match(/^\d+\. /)) return (
        <div key={i} className="ml-6 mb-3">
          <div className="flex items-start gap-3">
            <span className="text-lg font-bold text-emerald-400 mt-0.5 flex-shrink-0">
              {line.match(/^\d+/)?.[0]}.
            </span>
            <p className="text-lg text-slate-300 leading-relaxed">
              {line.replace(/^\d+\. /, '')}
            </p>
          </div>
        </div>
      );

      // Bold emphasis text
      if (line.startsWith('**') && line.endsWith('**')) return (
        <div key={i} className="bg-cyan-500/10 border-l-4 border-cyan-400 pl-6 py-4 my-6">
          <p className="text-xl font-bold text-cyan-200">
            💡 {line.replace(/\*\*/g, '')}
          </p>
        </div>
      );

      // Blockquotes
      if (line.startsWith('> ')) return (
        <blockquote key={i} className="border-l-4 border-purple-400 pl-6 py-4 bg-purple-500/5 italic my-6">
          <p className="text-lg text-purple-200 leading-relaxed">
            {line.slice(2)}
          </p>
        </blockquote>
      );

      // Empty lines for spacing
      if (line.trim() === '') return <div key={i} className="h-4" />;

      // Regular paragraphs with enhanced typography
      if (line.trim().length > 0) {
        return (
          <p key={i} className="text-lg text-slate-300 leading-relaxed mb-4">
            {line}
          </p>
        );
      }

      return null;
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-cyan-400 hover:text-cyan-300" 
          onClick={() => window.location.href = '/courses/ens-101'}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back to Course
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white mb-4">{currentModule.title}</CardTitle>
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${
                  currentModule.type === 'video' ? 'border-purple-400/40 text-purple-300' :
                  currentModule.type === 'code' ? 'border-emerald-400/40 text-emerald-300' :
                  currentModule.type === 'quiz' ? 'border-yellow-400/40 text-yellow-300' :
                  'border-cyan-400/40 text-cyan-300'
                }`}>
                  {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{currentModule.duration}</span>
                </div>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">{currentModule.description}</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Video Content */}
              {currentModule.type === 'video' && 'videoUrl' in currentModule && (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
                  <iframe 
                    src={currentModule.videoUrl} 
                    title={currentModule.title} 
                    allowFullScreen 
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* Text Content with Enhanced Hierarchy */}
              {currentModule.type === 'text' && 'content' in currentModule && currentModule.content && (
                <div className="space-y-6">
                  {renderTextContent(currentModule.content)}
                </div>
              )}

              {/* Code Content with Enhanced Styling */}
              {currentModule.type === 'code' && 'code' in currentModule && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-emerald-300 mb-4">💻 Code Example</h3>
                  <div className="bg-slate-950 border border-slate-700 rounded-xl p-6 shadow-2xl">
                    <pre className="text-base leading-relaxed overflow-x-auto">
                      <code className="font-mono text-emerald-300">
                        {currentModule.code}
                      </code>
                    </pre>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4">
                    <p className="text-emerald-200 font-medium">
                      💡 <strong>Try it yourself:</strong> Copy this code and experiment with it in your own project!
                    </p>
                  </div>
                </div>
              )}

              {/* Quiz Content with Enhanced Styling */}
              {currentModule.type === 'quiz' && 'quiz' in currentModule && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-yellow-300 mb-6">📝 Knowledge Check</h2>
                  
                  <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-8">
                    <p className="text-2xl font-semibold text-white mb-8 leading-relaxed">
                      {currentModule.quiz?.question}
                    </p>
                    
                    <div className="space-y-4">
                      {currentModule.quiz?.options.map((opt: string, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className={`w-full text-left justify-start p-6 text-lg transition-all ${
                            selectedOption === idx 
                              ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg font-semibold' 
                              : 'border-yellow-400/40 text-yellow-200 hover:border-yellow-400 hover:bg-yellow-400/10'
                          }`}
                          onClick={() => setSelectedOption(idx)}
                          disabled={showAnswer}
                        >
                          <span className="font-bold text-xl mr-4 min-w-[2rem]">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span>{opt}</span>
                        </Button>
                      ))}
                    </div>

                    {showAnswer && (
                      <div className="mt-8 p-6 rounded-lg bg-slate-800/50">
                        {selectedOption === currentModule.quiz?.answer ? (
                          <div className="flex items-center gap-3 text-emerald-400">
                            <BadgeCheck className="h-8 w-8" />
                            <div>
                              <p className="text-2xl font-bold">Correct! 🎉</p>
                              <p className="text-lg text-emerald-300 mt-1">Great job! You understand ENS fundamentals.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-red-400">
                            <HelpCircle className="h-8 w-8" />
                            <div>
                              <p className="text-2xl font-bold">Not quite right</p>
                              <p className="text-lg text-red-300 mt-1">Try again! Think about what makes ENS special.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!showAnswer && selectedOption !== null && (
                      <Button 
                        className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg rounded-lg transition-all shadow-lg" 
                        onClick={() => setShowAnswer(true)}
                      >
                        Check Answer
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Completion Section */}
              <div className="pt-8 border-t border-slate-700">
                {completedModules.has(moduleId) ? (
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-xl font-semibold">Completed! ✨</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline" 
              onClick={() => window.location.href = `/courses/ens-101/lesson/${moduleId - 1}`} 
              disabled={moduleId === 1}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Previous Lesson
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                if (!completedModules.has(moduleId)) markAsCompleted();
                if (moduleId === modules.length) {
                  try { await finishCourseBackend(); } catch (e) {}
                  window.location.href = '/courses/ens-101';
                } else {
                  window.location.href = `/courses/ens-101/lesson/${moduleId + 1}`;
                }
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-3"
            >
              {moduleId === modules.length ? 'Finish Course' : 'Next Lesson'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
