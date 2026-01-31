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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-400/20 via-cyan-400/15 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-purple-400/10 via-pink-400/10 to-emerald-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/15 via-teal-400/10 to-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
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
            <div className="border-cyan-400/30 bg-black/80 inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-sm badge" data-text-content>
              <span className="bg-emerald-400 mr-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                New
              </span>
              <span className="text-cyan-200">
                Web3 Learn &amp; Earn Platform launched!
              </span>
              <ChevronRight className="text-cyan-200 ml-1 h-4 w-4" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="from-cyan-300/90 via-slate-100/85 to-emerald-200/90 bg-gradient-to-tl bg-clip-text text-center text-4xl tracking-tighter text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Get Rewarded for Learning <br />
            <span className="from-emerald-400 via-cyan-400 to-blue-500 bg-gradient-to-r bg-clip-text text-transparent">
              On EthEd, your progress is owned by you.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-300 mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed"
          >
            EthEd helps you master blockchain from scratch—guided by AI, powered by real rewards. Earn points, NFT badges, and on-chain certificates as you learn. Sign up instantly (no wallet needed) and claim your unique ENS identity!
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
              className="group bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900 hover:from-cyan-400 hover:to-blue-500 hover:text-white relative overflow-hidden rounded-full px-6 shadow-lg transition-all duration-300"
              onClick={() => window.location.href = '/login'}
            >
            
              <Link href="/onboarding">
                <span className="relative z-10 flex items-center">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="from-blue-300 via-cyan-400/90 to-emerald-300/80 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
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
            <div className="border-cyan-300/30 bg-slate-900/80 overflow-hidden rounded-xl border shadow-2xl backdrop-blur-sm">
              <div className="border-cyan-300/30 bg-slate-800/90 flex h-10 items-center border-b px-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-slate-700/80 text-slate-300 mx-auto flex items-center rounded-md px-3 py-1 text-xs">
                  https://ethed.app
                </div>
              </div>
              <div className="relative h-64 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">EthEd Learning Platform</h3>
                    <p className="text-slate-400 text-sm">Master Web3 with AI-guided courses</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
              </div>
            </div>

            {/* Enhanced visual interest extras */}
            <div className="border-emerald-400/40 bg-slate-800/90 absolute -top-6 -right-6 h-12 w-12 rounded-lg border p-3 shadow-xl backdrop-blur-md">
              <div className="bg-emerald-400/30 h-full w-full rounded-md animate-pulse"></div>
            </div>
            <div className="border-cyan-400/40 bg-slate-800/90 absolute -bottom-4 -left-4 h-8 w-8 rounded-full border shadow-xl backdrop-blur-md animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="border-blue-400/40 bg-slate-800/90 absolute right-12 -bottom-6 h-10 w-10 rounded-lg border p-2 shadow-xl backdrop-blur-md">
              <div className="h-full w-full rounded-md bg-blue-400/30 animate-pulse" style={{ animationDelay: '2s' }}></div>
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
