'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import EthEdFeatures from './_components/features';
import Link from 'next/link';
import { Rocket, Wallet, MessageCircle, ShieldCheck, Globe } from 'lucide-react';
import HowItWorks from './_components/how-it-works';
import Stats from './_components/stats';

export default function EthEdHero() {
  return (
    <div className="bg-slate-950 relative w-full overflow-hidden min-h-screen">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 z-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/20 via-blue-400/15 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-blue-400/10 via-cyan-400/10 to-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/15 via-blue-400/10 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      {/* Global Grid is now handled at the layout level */}

      <div className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl" data-text-content>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex justify-center"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/60 px-3 py-1 text-xs uppercase tracking-wide text-cyan-200 shadow-cyan-glow backdrop-blur-md">
              <span className="bg-cyan-400/20 border border-cyan-400/40 rounded-full px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                New
              </span>
              <span>
                EIPSInsight Platform launched!
              </span>
              <ChevronRight className="text-cyan-400/70 h-3 w-3" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="from-cyan-300/90 via-slate-100/85 to-teal-200/90 bg-gradient-to-tl bg-clip-text text-center text-4xl tracking-tighter text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Get Rewarded for Learning <br />
            <span className="from-cyan-400 via-teal-400 to-blue-500 bg-gradient-to-r bg-clip-text text-transparent">
              On EIPSInsight, your progress is owned by you.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-300 mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed"
          >
            EIPSInsight helps you master blockchain from scratch—guided by AI, powered by real rewards. Earn points, NFT badges, and on-chain certificates as you learn. Sign up instantly (no wallet needed) and claim your unique ENS identity!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row cta-buttons"
            data-text-content
          >
            <Button
              asChild
              size="lg"
              className="group bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 hover:from-blue-500 hover:to-cyan-600 hover:text-white relative overflow-hidden rounded-full px-8 shadow-lg shadow-cyan-500/20 transition-all duration-300 h-14 text-lg font-bold"
              onClick={() => window.location.href = '/login'}
            >
            
              <Link href="/onboarding">
                <span className="relative z-10 flex items-center">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="from-blue-400 via-cyan-400 to-blue-500 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cyan-400/70 bg-black/30 flex items-center gap-2 rounded-full text-cyan-100 hover:bg-emerald-400/10 hover:text-white backdrop-blur-sm"
              onClick={() => window.location.href = '/courses'}
            >
              <Link href="/courses">
                <GraduationCap className="h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
          </motion.div>

          {/* Feature Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: 'spring',
              stiffness: 50,
            }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-1 shadow-cyan-glow backdrop-blur-md overflow-hidden">
              <div className="rounded-xl overflow-hidden border border-white/5 bg-slate-900/40">
                <div className="bg-slate-800/40 backdrop-blur-sm flex h-10 items-center justify-between px-4 border-b border-white/5">
                  <div className="flex space-x-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/60"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/60"></div>
                  </div>
                  <div className="bg-slate-950/50 text-slate-400 text-[10px] font-mono rounded-md px-3 py-1 border border-white/5">
                    https://eipsinsight.app
                  </div>
                  <div className="w-12"></div>
                </div>
                <div className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform group-hover:rotate-6">
                          <GraduationCap className="w-10 h-10 text-slate-900" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">EIPSInsight Learning Platform</h3>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto">Master Ethereum standards with AI-guided precision and verifiable rewards.</p>
                      
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="h-px w-8 bg-cyan-500/30"></div>
                        <div className="px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-500/5 text-[10px] uppercase font-bold text-cyan-400 tracking-widest">Dashboard v4.0</div>
                        <div className="h-px w-8 bg-cyan-500/30"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono">CORE-UPGRADE.EXEC</div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                        <Rocket className="h-4 w-4 text-cyan-400/70" />
                      </div>
                      <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-emerald-400/70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floaties updated to match EIPsInsight style */}
            <div className="absolute -top-6 -right-6 h-14 w-14 rounded-2xl border border-cyan-400/20 bg-slate-950/80 p-3 shadow-cyan-glow backdrop-blur-md animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 h-full w-full rounded-lg opacity-40"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 h-10 w-10 rounded-full border border-emerald-400/20 bg-slate-950/80 p-2 shadow-emerald-glow backdrop-blur-md animate-pulse">
              <div className="bg-emerald-400/40 h-full w-full rounded-full"></div>
            </div>
          </motion.div>

          {/* Trusted strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-10"
          >
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 rounded-xl border border-cyan-300/20 bg-black/30 px-4 py-3 text-xs text-slate-400 backdrop-blur-sm">
              <span className="text-slate-300">Powered by</span>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">ENS</span>
              <span className="rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1 text-teal-200">AI Buddy</span>
            </div>
          </motion.div>
        </div>
      </div>

      <EthEdFeatures/>

      {/* How it works + Stats */}
      <HowItWorks />
      <Stats />
    </div>
  );
}
