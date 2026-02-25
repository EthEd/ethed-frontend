'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Star, Shield, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const tiers = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'Perfect for beginners starting their Web3 journey.',
    features: [
      'Access to all basic courses',
      'Earn 10 XP per lesson',
      'Basic NFT Achievement badges',
      'Public learner profile'
    ],
    cta: 'Start Learning',
    popular: false,
  },
  {
    name: 'Scholar',
    price: '0.00 ETH',
    description: 'Early adopter access. Limited time offer.',
    features: [
      'Access to all Pro courses',
      'Priority AI tutor support',
      'Genesis Pioneer NFT eligibility',
      'Advanced learning analytics',
      'Discord community access'
    ],
    cta: 'Claim Scholar Status',
    popular: true,
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
          >
            <Trophy className="h-4 w-4" />
            Empowering the Next Billion Builders
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Decentralized Future</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            EthEd is currently in Early Access. All existing courses are free to celebrate our launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-8 rounded-3xl border ${
                tier.popular 
                  ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20' 
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-cyan-500 text-slate-950 text-xs font-bold rounded-full uppercase tracking-widest">
                  Early Adopter
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  {tier.price !== 'Free' && <span className="text-slate-400">/ forever</span>}
                </div>
                <p className="mt-4 text-slate-400">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-1 bg-cyan-500/20 rounded-full p-0.5">
                      <Check className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                asChild 
                className={`w-full py-6 text-lg font-bold rounded-2xl ${
                  tier.popular 
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <Link href="/onboarding">{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Secured by Polygon Network
            </p>
        </div>
      </div>
    </div>
  );
}
