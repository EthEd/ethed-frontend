"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Play,
  Clock,
  Users,
  Star,
  Trophy,
  Zap,
  Target,
  ArrowRight,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Lock,
  Unlock,
  Code,
  Globe,
  Coins,
  Shield,
  Lightbulb,
  Rocket,
  Brain,
  PawPrint,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
  Crown,
  Flame,
  Gift,
  Calendar,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  price: "Free" | "Pro" | "Premium";
  category: string;
  tags: string[];
  instructor: string;
  thumbnail: string;
  isNew?: boolean;
  isPopular?: boolean;
  progress?: number;
  nftReward?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  level: string;
  color: string;
  icon: any;
  skills: string[];
  completionReward: string;
}

const courses: Course[] = [
  {
    id: "blockchain-basics",
    title: "Blockchain Fundamentals",
    description: "Master the core concepts of blockchain technology, from cryptographic hashing to consensus mechanisms.",
    difficulty: "Beginner",
    duration: "4 weeks",
    lessons: 12,
    students: 8420,
    rating: 4.8,
    price: "Free",
    category: "Blockchain",
    tags: ["Bitcoin", "Ethereum", "Consensus", "Cryptography"],
    instructor: "Dr. Sarah Chen",
    thumbnail: "/courses/blockchain-basics.jpg",
    isPopular: true,
    progress: 0,
    nftReward: "Blockchain Pioneer NFT"
  },
  {
    id: "solidity-development",
    title: "Smart Contract Development with Solidity",
    description: "Learn to build, test, and deploy smart contracts on Ethereum using Solidity and modern development tools.",
    difficulty: "Intermediate",
    duration: "8 weeks",
    lessons: 24,
    students: 6150,
    rating: 4.9,
    price: "Pro",
    category: "Development",
    tags: ["Solidity", "Smart Contracts", "Testing", "Deployment"],
    instructor: "Marcus Rodriguez",
    thumbnail: "/courses/solidity-dev.jpg",
    isNew: true,
    progress: 35,
    nftReward: "Solidity Master NFT"
  },
  {
    id: "defi-protocols",
    title: "DeFi Protocol Architecture",
    description: "Understand how decentralized finance protocols work, from AMMs to lending platforms and yield farming.",
    difficulty: "Advanced",
    duration: "10 weeks",
    lessons: 30,
    students: 3280,
    rating: 4.7,
    price: "Premium",
    category: "DeFi",
    tags: ["DeFi", "AMM", "Lending", "Yield Farming"],
    instructor: "Aisha Patel",
    thumbnail: "/courses/defi-protocols.jpg",
    nftReward: "DeFi Architect NFT"
  },
  {
    id: "web3-frontend",
    title: "Web3 Frontend Development",
    description: "Build modern DApp frontends using React, ethers.js, and popular Web3 libraries.",
    difficulty: "Intermediate",
    duration: "6 weeks",
    lessons: 18,
    students: 4920,
    rating: 4.6,
    price: "Pro",
    category: "Development",
    tags: ["React", "ethers.js", "Web3", "DApp"],
    instructor: "Jake Thompson",
    thumbnail: "/courses/web3-frontend.jpg",
    isPopular: true,
    nftReward: "Frontend Builder NFT"
  },
  {
    id: "nft-development",
    title: "NFT Development & Marketplaces",
    description: "Create, deploy, and trade NFTs. Learn ERC-721, ERC-1155, and build your own NFT marketplace.",
    difficulty: "Intermediate",
    duration: "5 weeks",
    lessons: 15,
    students: 5670,
    rating: 4.8,
    price: "Free",
    category: "NFTs",
    tags: ["NFT", "ERC-721", "OpenSea", "Marketplace"],
    instructor: "Luna Kim",
    thumbnail: "/courses/nft-development.jpg",
    isNew: true,
    nftReward: "NFT Creator NFT"
  },
  {
    id: "dao-governance",
    title: "DAO Governance & Tokenomics",
    description: "Design and implement decentralized autonomous organizations with effective governance mechanisms.",
    difficulty: "Advanced",
    duration: "7 weeks",
    lessons: 21,
    students: 2140,
    rating: 4.9,
    price: "Premium",
    category: "Governance",
    tags: ["DAO", "Governance", "Tokenomics", "Voting"],
    instructor: "Dr. Emily Watson",
    thumbnail: "/courses/dao-governance.jpg",
    nftReward: "DAO Architect NFT"
  }
];

const learningPaths: LearningPath[] = [
  {
    id: "web3-developer",
    title: "Complete Web3 Developer",
    description: "Go from zero to full-stack Web3 developer with our comprehensive learning path",
    courses: 8,
    duration: "16-20 weeks",
    level: "Beginner to Advanced",
    color: "emerald",
    icon: Code,
    skills: ["Solidity", "React", "Web3.js", "DApp Development", "Testing", "Deployment"],
    completionReward: "Web3 Developer Master NFT + Certificate"
  },
  {
    id: "defi-specialist",
    title: "DeFi Protocol Specialist",
    description: "Master decentralized finance protocols and become a DeFi expert",
    courses: 6,
    duration: "12-15 weeks",
    level: "Intermediate to Advanced",
    color: "cyan",
    icon: Coins,
    skills: ["AMM Design", "Lending Protocols", "Yield Strategies", "Risk Management"],
    completionReward: "DeFi Master NFT + Job Placement Assistance"
  },
  {
    id: "security-auditor",
    title: "Smart Contract Security Auditor",
    description: "Learn to identify vulnerabilities and audit smart contracts professionally",
    courses: 5,
    duration: "10-12 weeks",
    level: "Advanced",
    color: "red",
    icon: Shield,
    skills: ["Security Patterns", "Vulnerability Analysis", "Audit Reports", "Tools"],
    completionReward: "Security Expert NFT + Audit Certification"
  },
  {
    id: "blockchain-architect",
    title: "Blockchain Protocol Architect",
    description: "Design and build custom blockchain protocols and consensus mechanisms",
    courses: 7,
    duration: "14-18 weeks",
    level: "Advanced",
    color: "purple",
    icon: Brain,
    skills: ["Consensus Design", "Protocol Development", "Network Security", "Scalability"],
    completionReward: "Protocol Architect NFT + Research Opportunities"
  }
];

const categories = ["All", "Blockchain", "Development", "DeFi", "NFTs", "Governance", "Security"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const prices = ["All", "Free", "Pro", "Premium"];

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCourses = courses.filter(course => {
    return (
      (selectedCategory === "All" || course.category === selectedCategory) &&
      (selectedDifficulty === "All" || course.difficulty === selectedDifficulty) &&
      (selectedPrice === "All" || course.price === selectedPrice) &&
      (searchQuery === "" || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-400 bg-green-400/10";
      case "Intermediate": return "text-yellow-400 bg-yellow-400/10";
      case "Advanced": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case "Free": return "text-emerald-400 bg-emerald-400/10";
      case "Pro": return "text-cyan-400 bg-cyan-400/10";
      case "Premium": return "text-purple-400 bg-purple-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-slate-700 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Learn & Build</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Master Web3
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Learn blockchain development with interactive lessons, hands-on projects, 
            and NFT credentials that prove your skills to employers worldwide.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
            {[
              { label: "Courses", value: "200+", icon: BookOpen },
              { label: "Students", value: "12K+", icon: Users },
              { label: "NFTs Earned", value: "45K+", icon: Award },
              { label: "Success Rate", value: "94%", icon: Trophy }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-slate-950/60 backdrop-blur-md border border-cyan-400/10 text-center rounded-2xl">
                  <CardContent className="p-4">
                    <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Learning Paths */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Target className="w-8 h-8 text-cyan-400" />
              Learning Paths
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Structured curricula designed to take you from beginner to expert in specific Web3 domains
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {learningPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-950/60 backdrop-blur-md border border-cyan-400/10 h-full hover:border-cyan-400/30 transition-all duration-300 group rounded-2xl shadow-lg hover:shadow-cyan-400/5">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20`}>
                          <Icon className={`w-6 h-6 text-cyan-400`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                            {path.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span>{path.courses} courses</span>
                            <span>{path.duration}</span>
                            <Badge variant="outline" className="text-xs border-cyan-400/20 text-cyan-400">
                              {path.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-400 leading-relaxed">
                        {path.description}
                      </p>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Skills You'll Master:</h4>
                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                        <p className="text-cyan-200 text-sm font-medium">
                          🏆 Completion Reward: {path.completionReward}
                        </p>
                      </div>

                      <Button className="w-full border-cyan-400/20 hover:bg-cyan-400/10 text-cyan-400 hover:text-cyan-300" variant="outline">
                        View Path Details
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Courses Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Courses
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Hands-on courses taught by industry experts with real-world projects and NFT credentials
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, skills, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-cyan-400/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-cyan-400/10 text-slate-300 hover:bg-slate-900 bg-slate-950/60"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Card className="bg-slate-950/60 backdrop-blur-md border border-cyan-400/10 rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Category Filter */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Category</h4>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                selectedCategory === category
                                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/20"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Filter */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Difficulty</h4>
                        <div className="space-y-2">
                          {difficulties.map((difficulty) => (
                            <button
                              key={difficulty}
                              onClick={() => setSelectedDifficulty(difficulty)}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                selectedDifficulty === difficulty
                                  ? "bg-blue-500/10 text-blue-300 border border-blue-400/20"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                              }`}
                            >
                              {difficulty}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price Filter */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Price</h4>
                        <div className="space-y-2">
                          {prices.map((price) => (
                            <button
                              key={price}
                              onClick={() => setSelectedPrice(price)}
                              className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                selectedPrice === price
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                              }`}
                            >
                              {price}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full hover:border-white/20 transition-all duration-300 group overflow-hidden">
                    {/* Course Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-slate-400" />
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {course.isNew && (
                          <Badge className="bg-emerald-500 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            New
                          </Badge>
                        )}
                        {course.isPopular && (
                          <Badge className="bg-orange-500 text-white">
                            <Flame className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className={getPriceColor(course.price)}>
                          {course.price === "Free" ? (
                            <>
                              <Gift className="w-3 h-3 mr-1" />
                              Free
                            </>
                          ) : course.price}
                        </Badge>
                      </div>

                      {/* Progress Bar for Enrolled Courses */}
                      {course.progress !== undefined && course.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="bg-slate-950/80 rounded-lg p-2 backdrop-blur-sm border border-cyan-400/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-300">Progress</span>
                              <span className="text-xs text-cyan-400">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-1 bg-slate-800" />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
                          {course.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-cyan-400/60" />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4 text-cyan-400/60" />
                          {course.lessons} lessons
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                        {course.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {course.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs bg-slate-900 text-slate-400 border-none">
                            {tag}
                          </Badge>
                        ))}
                        {course.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-slate-900 text-slate-400 border-none">
                            +{course.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className={`${getDifficultyColor(course.difficulty)} border-none`}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            {course.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.students.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* NFT Reward */}
                      {course.nftReward && (
                        <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-cyan-400" />
                            <p className="text-cyan-200 text-sm font-medium">
                              Earn: {course.nftReward}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg shadow-cyan-900/20" asChild>
                        <Link href={`/learn/${course.id}`}>
                          {course.progress !== undefined && course.progress > 0 ? (
                            <>
                              Continue Learning
                              <Play className="w-4 h-4 ml-2" />
                            </>
                          ) : (
                            <>
                              {course.price === "Free" ? "Start Free" : "Enroll Now"}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
              <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria</p>
              <Button 
                variant="outline" 
                className="border-cyan-400/20 text-cyan-400"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSelectedPrice("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-slate-950/60 border border-cyan-400/20 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Ready to Start Your Web3 Journey?
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                  Join 12,000+ developers mastering Web3. 
                  Get personalized learning paths, earn NFT credentials, and build your blockchain career.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full px-8">
                    <Link href="/onboarding">
                      Start Learning Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10 rounded-full px-8">
                    <Link href="/how-it-works">
                      See How It Works
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 mt-12 text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Free courses available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">NFT certificates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Structured Curriculum</span>
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