'use client';

import React from 'react';
import { ArrowRight, Clock, Star, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

const courses = [
  {
    id: 'eips-101',
    title: 'EIPs 101: From First Principles to First Proposal',
    description: 'Master Ethereum Improvement Proposals from basics to writing your first EIP using EIPsInsight\'s tools.',
    level: 'Beginner',
    duration: '2-3 hours',
    students: 1200,
    rating: 4.8,
    price: 'Free',
    badge: 'EIP Expert NFT',
    topics: ['Ethereum', 'EIPs', 'ERCs', 'Governance'],
    href: '/courses/eips-101',
    available: true
  },
  {
    id: 'ens-101',
    title: 'ENS 101: Ethereum Name Service Essentials',
    description: 'Learn how Ethereum Name Service works, register names, integrate with dApps, and build ENS-powered apps.',
    level: 'Beginner',
    duration: '2 hours',
    students: 900,
    rating: 4.7,
    price: 'Free',
    badge: 'ENS Pro NFT',
    topics: ['ENS', 'Domains', 'Web3', 'Integration'],
    href: '/courses/ens-101',
    available: true
  },
  {
    id: '0g-101',
    title: '0G 101: AI-Native Blockchain Infrastructure',
    description: 'Master 0G\'s decentralized AI stack - storage, compute, and inference for next-generation blockchain applications.',
    level: 'Beginner',
    duration: '4 hours',
    students: 320,
    rating: 4.9,
    price: 'Free',
    badge: '0G Infrastructure NFT',
    topics: ['0G', 'AI Infrastructure', 'Decentralized Storage', 'GPU Networks'],
    href: '/courses/0g-101',
    available: true
  },
  {
    id: 'blockchain-basics',
    title: 'Blockchain Fundamentals',
    description: 'Understand how blockchain works, from cryptographic hashing to consensus mechanisms.',
    level: 'Beginner',
    duration: '4-5 hours',
    students: 2500,
    rating: 4.9,
    price: 'Free',
    badge: 'Blockchain Foundation NFT',
    topics: ['Hashing', 'Merkle Trees', 'Consensus', 'Mining vs Staking'],
    href: '/courses/blockchain-basics',
    available: false
  },
  {
    id: 'solidity-dev',
    title: 'Smart Contract Development',
    description: 'Build and deploy your first smart contracts using Solidity and modern tooling.',
    level: 'Intermediate',
    duration: '8-10 hours',
    students: 950,
    rating: 4.7,
    price: 'Premium',
    badge: 'Smart Contract Developer NFT',
    topics: ['Solidity Syntax', 'Testing', 'Deployment', 'Security'],
    href: '/courses/solidity-dev',
    available: false
  },
  {
    id: 'defi-protocols',
    title: 'DeFi Protocol Analysis',
    description: 'Analyze major DeFi protocols, understand yield farming, and liquidity mechanics.',
    level: 'Advanced',
    duration: '6-8 hours',
    students: 680,
    rating: 4.6,
    price: 'Premium',
    badge: 'DeFi Analyst NFT',
    topics: ['AMMs', 'Yield Farming', 'Governance', 'Risk Assessment'],
    href: '/courses/defi-protocols',
    available: false
  },
  {
    id: 'nft-ecosystem',
    title: 'NFT Standards & Marketplaces',
    description: 'Deep dive into ERC-721, ERC-1155, and the NFT ecosystem including marketplaces.',
    level: 'Intermediate',
    duration: '5-6 hours',
    students: 1100,
    rating: 4.5,
    price: 'Free',
    badge: 'NFT Specialist NFT',
    topics: ['ERC Standards', 'Metadata', 'Marketplaces', 'Royalties'],
    href: '/courses/nft-ecosystem',
    available: false
  },
  {
    id: 'web3-security',
    title: 'Web3 Security Fundamentals',
    description: 'Learn to identify and prevent common smart contract vulnerabilities and exploits.',
    level: 'Advanced',
    duration: '7-9 hours',
    students: 425,
    rating: 4.9,
    price: 'Premium',
    badge: 'Security Auditor NFT',
    topics: ['Reentrancy', 'Flash Loans', 'Governance Attacks', 'Best Practices'],
    href: '/courses/web3-security',
    available: false
  }
];

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
  const availableCourses = courses.filter(course => course.available);
  const comingSoonCourses = courses.filter(course => !course.available);

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
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent mb-6">
            Master Web3 & Blockchain
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Learn blockchain fundamentals, smart contracts, DeFi, and more. Earn verifiable NFT credentials as you progress through hands-on courses.
          </p>
        </motion.div>

        {/* Available Courses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Available Courses</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <motion.div key={course.id} variants={cardVariants}>
                <Card className="h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-400/20 hover:border-emerald-400/40 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-emerald-400/10 text-emerald-300 rounded-full border border-emerald-400/20">
                        {course.level}
                      </span>
                      <span className="text-xs font-bold text-cyan-400">{course.price}</span>
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-cyan-300 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-400/20">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-purple-300">{course.badge}</span>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1">
                      {course.topics.slice(0, 3).map((topic) => (
                        <span key={topic} className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
                          {topic}
                        </span>
                      ))}
                      {course.topics.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
                          +{course.topics.length - 3}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-slate-900 hover:text-white transition-all duration-300"
                      onClick={() => window.location.href = course.href}
                    >
                      Start Course
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Coming Soon Courses */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-semibold text-slate-400 mb-8 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Coming Soon
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonCourses.map((course) => (
              <motion.div key={course.id} variants={cardVariants}>
                <Card className="h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-600/20 opacity-75">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
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