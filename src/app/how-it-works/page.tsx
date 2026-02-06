"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Zap,
  Heart,
  Globe,
  Gift,
  Crown,
  Star,
  Brain,
  Target,
  TrendingUp,
  Wallet,
  PawPrint,
  MessageCircle,
  Code,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  details: string[];
  demo?: React.ReactNode;
}

interface Feature {
  title: string;
  description: string;
  icon: any;
  color: string;
  benefits: string[];
}

const learningSteps: Step[] = [
  {
    id: 1,
    title: "Connect Your Wallet & Profile",
    description: "Initialize your Web3 journey by connecting your wallet and setting up your decentralized profile",
    icon: Wallet,
    color: "cyan",
    details: [
      "Connect with MetaMask, Coinbase, or WalletConnect",
      "Initialize your on-chain identity",
      "Set your learning preferences and goals",
      "Join the global community of Web3 builders"
    ]
  },
  {
    id: 2,
    title: "Claim Your ENS Identity",
    description: "Get your unique eth.ed subdomain for your permanent blockchain identity",
    icon: Globe,
    color: "blue",
    details: [
      "Receive a free yourname.ethed.eth subdomain",
      "Use it across the entire Web3 ecosystem",
      "Build your decentralized reputation",
      "Own your digital identity forever"
    ]
  },
  {
    id: 3,
    title: "Learn Through Interactive Courses",
    description: "Engage with hands-on lessons designed for Web3 developers",
    icon: BookOpen,
    color: "indigo",
    details: [
      "Interactive coding challenges and quizzes",
      "Real-world project-based learning",
      "Self-paced curriculum from experts",
      "Community discussions and peer learning"
    ]
  },
  {
    id: 4,
    title: "Earn NFT Credentials",
    description: "Collect verifiable achievements and build your Web3 portfolio",
    icon: Award,
    color: "purple",
    details: [
      "NFT certificates for completed courses",
      "Skill badges for specific competencies",
      "Achievement tokens for milestones",
      "Tradeable and verifiable credentials"
    ]
  }
];

const keyFeatures: Feature[] = [
  {
    title: "Interactive Roadmap",
    description: "Dynamic learning paths that adapt as you progress through challenges",
    icon: Target,
    color: "cyan",
    benefits: [
      "Progressive difficulty scaling",
      "Automated skill gap analysis",
      "Project-driven milestones",
      "Curated resource recommendations"
    ]
  },
  {
    title: "Blockchain Integration",
    description: "True ownership of your achievements and progress on-chain",
    icon: Wallet,
    color: "blue",
    benefits: [
      "Immutable learning records",
      "Portable credentials across platforms", 
      "Decentralized identity ownership",
      "Smart contract verified skills"
    ]
  },
  {
    title: "Community Learning",
    description: "Connect with fellow learners and industry experts worldwide",
    icon: Users,
    color: "indigo",
    benefits: [
      "Peer-to-peer knowledge sharing",
      "Expert-led workshops and AMAs",
      "Collaborative project opportunities",
      "Global developer network access"
    ]
  },
  {
    title: "Real-World Projects", 
    description: "Build actual DApps and smart contracts while learning",
    icon: Code,
    color: "purple",
    benefits: [
      "Hands-on coding experience",
      "Deploy to live testnets",
      "Build portfolio-worthy projects",
      "Industry-relevant skill development"
    ]
  }
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const currentStep = learningSteps.find(step => step.id === activeStep);

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="from-purple-400/10 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-cyan-300/5 absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Learn. Build. Own.</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
          >
            How EIPSInsight Works
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Discover how EIPSInsight revolutionizes Web3 education with permanent 
            blockchain credentials and hands-on learning experiences.
          </motion.p>
        </div>

        {/* Interactive Learning Flow */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Learning Journey
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Follow these steps to transform from Web3 curious to blockchain builder
            </p>
          </div>

          {/* Step Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-4 p-2 bg-slate-950/60 rounded-2xl border border-cyan-400/10 backdrop-blur-md">
              {learningSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeStep === step.id
                        ? `bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 shadow-glow-cyan`
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">{step.title}</span>
                    <span className="font-medium sm:hidden">Step {step.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Content */}
          <AnimatePresence mode="wait">
            {currentStep && (
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                {/* Step Details */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 shadow-lg shadow-cyan-900/10">
                      <currentStep.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <Badge variant="outline" className="text-xs border-cyan-400/20 text-cyan-400">
                      Step {currentStep.id}
                    </Badge>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-6">
                    {currentStep.title}
                  </h3>
                  
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    {currentStep.description}
                  </p>
                  
                  <ul className="space-y-4">
                    {currentStep.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interactive Demo */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-50" />
                  <Card className="bg-slate-950/60 backdrop-blur-md border border-cyan-400/10 overflow-hidden rounded-[2rem] relative">
                    <CardContent className="p-0">
                      {/* Demo content based on current step */}
                      {activeStep === 1 && (
                        <div className="p-8">
                          <h4 className="text-xl font-semibold text-white mb-6">Web3 Authentication</h4>
                          <div className="space-y-4">
                            {[
                              { name: 'MetaMask', icon: '🦊' },
                              { name: 'Coinbase Wallet', icon: '🛡️' },
                              { name: 'WalletConnect', icon: '🔗' }
                            ].map((wallet) => (
                              <div
                                key={wallet.name}
                                className="p-4 rounded-xl border border-cyan-400/10 bg-slate-900/40 hover:border-cyan-400/30 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{wallet.icon}</span>
                                  <span className="font-medium text-slate-200">{wallet.name}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 p-4 bg-cyan-500/5 rounded-xl border border-cyan-400/10">
                            <p className="text-cyan-300 text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Safe and secure decentralized login
                            </p>
                          </div>
                        </div>
                      )}

                      {activeStep === 2 && (
                        <div className="p-8">
                          <h4 className="text-xl font-semibold text-white mb-6">Your ENS Identity</h4>
                          <div className="space-y-6">
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  placeholder="yourname"
                                  className="w-full px-4 py-3 bg-slate-900/60 border border-cyan-400/10 rounded-xl text-white outline-none focus:border-cyan-400/30 transition-all"
                                  defaultValue="alex-dev"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">.ethed.eth</span>
                              </div>
                            </div>
                            <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-2xl shadow-inner">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30">
                                  <Globe className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                  <p className="text-cyan-100 font-bold text-lg">alex-dev.ethed.eth</p>
                                  <p className="text-slate-400 text-sm">Global Web3 Identifier</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 3 && (
                        <div className="p-8">
                          <h4 className="text-xl font-semibold text-white mb-6">Interactive Learning</h4>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-cyan-400/10">
                              <span className="text-white font-medium">Smart Contract Basics</span>
                              <Badge className="bg-cyan-500/10 text-cyan-400 border-none">Module 01</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400 text-xs">COURSE PROGRESS</span>
                                <span className="text-cyan-400 text-xs font-bold">65%</span>
                              </div>
                              <Progress value={65} className="h-2 bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                                <BookOpen className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                <p className="text-indigo-200 text-sm font-bold">12 Lessons</p>
                              </div>
                              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                <p className="text-blue-200 text-sm font-bold">8 Projects</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeStep === 4 && (
                        <div className="p-8">
                          <h4 className="text-xl font-semibold text-white mb-6">NFT Achievements</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30 text-center shadow-lg hover:shadow-indigo-500/10 transition-shadow">
                              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 border border-yellow-400/30">
                                <Crown className="w-8 h-8 text-yellow-400" />
                              </div>
                              <h5 className="text-white font-bold text-sm mb-1 line-clamp-1">Smart Contract Master</h5>
                              <Badge variant="outline" className="text-[10px] border-yellow-400/30 text-yellow-400 h-5">Legendary</Badge>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 text-center shadow-lg hover:shadow-cyan-500/10 transition-shadow">
                              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
                                <Star className="w-8 h-8 text-cyan-400" />
                              </div>
                              <h5 className="text-white font-bold text-sm mb-1 line-clamp-1">DApp Developer</h5>
                              <Badge variant="outline" className="text-[10px] border-cyan-400/30 text-cyan-400 h-5">Epic</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation Arrows */}
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="border-cyan-400/20 text-slate-400 hover:bg-slate-900 rounded-xl px-8"
            >
              Previous Step
            </Button>
            <Button
              onClick={() => setActiveStep(Math.min(4, activeStep + 1))}
              disabled={activeStep === 4}
              className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-8 shadow-lg shadow-cyan-900/20"
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why eth.ed is Different
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Revolutionary features that make Web3 learning engaging, verifiable, and rewarding
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isExpanded = expandedFeature === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full hover:border-white/20 transition-all duration-300 group cursor-pointer">
                    <CardHeader 
                      className="pb-4"
                      onClick={() => setExpandedFeature(isExpanded ? null : index)}
                    >
                      <div className={`p-3 rounded-xl bg-${feature.color}-500/20 border border-${feature.color}-400/40 w-fit group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 text-${feature.color}-300`} />
                      </div>
                      <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                        {feature.title}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </CardTitle>
                      <p className="text-slate-300 text-sm">
                        {feature.description}
                      </p>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-0">
                            <ul className="space-y-2">
                              {feature.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex} className="flex items-start gap-2">
                                  <CheckCircle className={`w-4 h-4 text-${feature.color}-400 mt-0.5 flex-shrink-0`} />
                                  <span className="text-slate-300 text-sm">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Learning Path Preview */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Structured Learning Paths
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Progress from beginner to expert with our carefully crafted curriculum
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                level: "Beginner",
                title: "Web3 Fundamentals",
                duration: "4-6 weeks",
                courses: 5,
                color: "cyan",
                topics: ["Blockchain Basics", "Crypto Wallets", "Smart Contracts Intro", "DeFi Concepts", "NFT Fundamentals"]
              },
              {
                level: "Intermediate", 
                title: "Smart Contract Development",
                duration: "8-10 weeks",
                courses: 8,
                color: "blue",
                topics: ["Solidity Programming", "Contract Testing", "Security Best Practices", "DApp Frontend", "IPFS Integration"]
              },
              {
                level: "Advanced",
                title: "DeFi & Protocol Building",
                duration: "12-16 weeks", 
                courses: 12,
                color: "purple",
                topics: ["Advanced DeFi", "Protocol Design", "MEV & Arbitrage", "Cross-chain", "Governance Systems"]
              }
            ].map((path, index) => (
              <Card key={index} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`bg-${path.color}-500/20 text-${path.color}-300`}>
                      {path.level}
                    </Badge>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">{path.duration}</p>
                      <p className="text-slate-300 text-sm font-medium">{path.courses} courses</p>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                    {path.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {path.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${path.color}-400`} />
                        <span className="text-slate-300 text-sm">{topic}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    View Curriculum
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 backdrop-blur-xl">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Start Your Web3 Journey?
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  Join thousands of developers already learning and building on eth.ed. 
                  Master the Ethereum stack, claim your ENS identity, and earn NFT credentials as you learn.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                    <Link href="/onboarding">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    <Link href="/courses">
                      Explore Courses
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 mt-8 text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Own your credentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">AI-powered learning</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}