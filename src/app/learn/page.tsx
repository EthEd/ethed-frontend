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
  Target,
  ArrowRight,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Code,
  Coins,
  Shield,
  Brain,
  Award,
  Sparkles,
  Flame,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { courses, type Course } from "@/lib/courses";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  coursesLength: number;
  duration: string;
  level: string;
  color: string;
  icon: any;
  skills: string[];
  completionReward: string;
}

const learningPaths: LearningPath[] = [
  {
    id: "web3-developer",
    title: "Complete Web3 Developer",
    description: "Go from zero to full-stack Web3 developer with our comprehensive learning path",
    coursesLength: 8,
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
    coursesLength: 6,
    duration: "12-15 weeks",
    level: "Intermediate to Advanced",
    color: "cyan",
    icon: Coins,
    skills: ["AMM Design", "Lending Protocols", "Yield Strategies", "Risk Management"],
    completionReward: "DeFi Master NFT"
  }
];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);

  useEffect(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory]);

  const categories = ["All", ...Array.from(new Set(courses.map(c => c.category)))];

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20 px-4 py-1">
                <Sparkles className="w-3 h-3 mr-2" />
                The Future of Education
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Web3 Potential</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                Choose from our selection of high-quality courses designed to take you from beginner to expert in the blockchain space.
              </p>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 p-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses, skills, or tags..."
                  className="w-full bg-transparent border-none focus:ring-0 text-white pl-12 pr-4 py-3 placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="bg-slate-800 text-white border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 cursor-pointer min-w-[140px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 rounded-xl transition-all shadow-lg shadow-cyan-500/20">
                  Search
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link href={`/learn/${course.id}`}>
                  <Card className="group bg-slate-900/40 border-white/5 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        {course.isNew && (
                          <Badge className="bg-emerald-500 text-white border-none">New</Badge>
                        )}
                        {course.isPopular && (
                          <Badge className="bg-orange-500 text-white border-none">Popular</Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-white/10 uppercase text-[10px] tracking-widest px-2 py-1">
                          {course.category}
                        </Badge>
                      </div>
                      <div className="w-full h-full bg-slate-800 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center text-slate-600">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    </div>
                    <CardHeader className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(course.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1">({course.rating})</span>
                        </div>
                        <span className="text-xs font-medium text-slate-500">{course.lessons} Lessons</span>
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-cyan-400 transition-colors duration-300">
                        {course.title}
                      </CardTitle>
                      <p className="text-slate-400 text-sm mt-3 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 mt-auto">
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Instructor</span>
                          <span className="text-sm font-medium text-slate-300">{course.instructor}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${course.price === 'Free' ? 'text-emerald-400' : 'text-white'}`}>
                            {course.price}
                          </div>
                          {course.nftReward && (
                            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
                              <Award className="w-3 h-3" />
                              NFT Reward
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Mastery Paths</h2>
          <p className="text-slate-400 max-w-2xl">Step-by-step curriculum guided by experts to help you master specific Web3 domains.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {learningPaths.map((path) => (
            <div key={path.id} className="relative group rounded-3xl overflow-hidden">
               <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-300 group-hover:scale-105 opacity-10 group-hover:opacity-20 ${
                path.color === 'emerald' ? 'from-emerald-500 to-cyan-500' : 'from-cyan-500 to-blue-500'
              }`} />
              <div className="relative p-8 border border-white/5 bg-slate-900/40 backdrop-blur-xl h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-${path.color}-500/10`}>
                    <path.icon className={`w-8 h-8 text-${path.color}-400`} />
                  </div>
                  <Badge className={`bg-${path.color}-500/10 text-${path.color}-400 border-${path.color}-500/20`}>
                    {path.level}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{path.title}</h3>
                <p className="text-slate-400 mb-6">{path.description}</p>
                <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                  {path.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="bg-slate-800/50 border-white/10 text-slate-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Duration</span>
                      <span className="text-sm font-medium text-slate-300">{path.duration}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Courses</span>
                      <span className="text-sm font-medium text-slate-300">{path.coursesLength} Units</span>
                    </div>
                  </div>
                  <Button variant="ghost" className="group/btn text-slate-300 hover:text-white hover:bg-white/5 px-0 flex items-center gap-2">
                    View Path <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
