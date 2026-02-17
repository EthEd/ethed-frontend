// Enhanced course structure with prerequisites, learning paths, and better organization

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type LessonType = 'reading' | 'video' | 'quiz' | 'coding' | 'project' | 'discussion';

export interface Prerequisite {
  courseId: string;
  courseName: string;
  required: boolean; // true = must complete, false = recommended
}

export interface LessonMetadata {
  id: number;
  title: string;
  type: LessonType;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  hasQuiz: boolean;
  estimatedTime: string;
  keyTakeaways: string[];
  resources?: string[];
  // Optional direct video URL for `video` lessons (YouTube embed URL expected)
  videoUrl?: string;
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  lessons: LessonMetadata[];
  estimatedTime: string;
  rewardBadge?: string;
}

export interface EnhancedCourse {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  learningPath: string; // e.g., "Fundamentals" | "Infrastructure" | "Development"
  duration: string;
  students: number;
  rating: number;
  price: string;
  badge: string;
  topics: string[];
  href: string;
  available: boolean;
  prerequisites: Prerequisite[];
  modules: CourseModule[];
  totalLessons: number;
  estimatedTotalTime: string;
  learningOutcomes: string[];
  skillsGained: string[];
  nextRecommendedCourse?: string;
  difficultyMilestones: {
    percentage: number;
    reward: string;
    message: string;
  }[];
}

export const coursesWithPath: EnhancedCourse[] = [
  {
    id: 'eips-101',
    title: 'EIPs 101: From First Principles to First Proposal',
    description: 'Master Ethereum Improvement Proposals from basics to writing your first EIP using EthEd\'s tools.',
    level: 'Beginner',
    learningPath: 'Fundamentals',
    duration: '2-3 hours',
    students: 1200,
    rating: 4.8,
    price: 'Free',
    badge: 'EIP Expert NFT',
    topics: ['Ethereum', 'EIPs', 'ERCs', 'Governance'],
    href: '/courses/eips-101',
    available: true,
    prerequisites: [],
    totalLessons: 8,
    estimatedTotalTime: '2-3 hours',
    learningOutcomes: [
      'Understand the EIP process and governance',
      'Read and analyze real EIPs',
      'Draft your first EIP proposal',
      'Contribute to Ethereum development'
    ],
    skillsGained: ['Ethereum Governance', 'Technical Writing', 'Protocol Design', 'Community Engagement'],
    nextRecommendedCourse: 'ens-101',
    difficultyMilestones: [
      { percentage: 25, reward: 'Novice Badge', message: '🎉 You\'re 25% through! Great start!' },
      { percentage: 50, reward: 'Intermediate Certificate', message: '⭐ Halfway there! You\'re crushing it!' },
      { percentage: 75, reward: 'Advanced Badge', message: '🚀 Almost done! Final push!' },
      { percentage: 100, reward: 'EIP Expert NFT', message: '🏆 Congratulations! You\'re an EIP Expert!' }
    ],
    modules: [
      {
        id: 1,
        title: 'Foundation Module',
        description: 'Understand Ethereum fundamentals and the EIP process',
        estimatedTime: '2-3 hours',
        lessons: [
          // Video lesson moved to lesson ID 1; remaining lessons shifted so total stays 8
          { id: 1, title: 'EIPs 101 — Intro (Video)', type: 'video', duration: 10, difficulty: 'Easy', xpReward: 50, hasQuiz: false, estimatedTime: '10 min', keyTakeaways: ['Overview of EIPs and course roadmap'], videoUrl: 'https://www.youtube.com/embed/9CuuCAJWUTw' },
          { id: 2, title: 'Ethereum in Plain Language', type: 'reading', duration: 15, difficulty: 'Easy', xpReward: 100, hasQuiz: true, estimatedTime: '15 min', keyTakeaways: ['Ethereum is a global computer', 'Smart contracts enable programmable transactions', 'Decentralization removes single points of failure'] },
          { id: 3, title: 'What is an EIP?', type: 'reading', duration: 10, difficulty: 'Easy', xpReward: 80, hasQuiz: false, estimatedTime: '10 min', keyTakeaways: ['Purpose of EIPs', 'Proposal lifecycle', 'Who can author an EIP'] },
          { id: 4, title: 'Types of EIPs', type: 'reading', duration: 12, difficulty: 'Easy', xpReward: 80, hasQuiz: false, estimatedTime: '12 min', keyTakeaways: ['Standards track vs informational vs meta', 'ERCs and interfaces'] },
          { id: 5, title: 'EIP Lifecycle', type: 'reading', duration: 18, difficulty: 'Medium', xpReward: 120, hasQuiz: false, estimatedTime: '18 min', keyTakeaways: ['Draft → review → last call → final', 'Editor roles and community process'] },
          { id: 6, title: 'Anatomy of an EIP', type: 'reading', duration: 20, difficulty: 'Medium', xpReward: 120, hasQuiz: false, estimatedTime: '20 min', keyTakeaways: ['Preamble, abstract, motivation, specification, rationale'] },
          { id: 7, title: 'Famous EIP Case Studies', type: 'reading', duration: 25, difficulty: 'Medium', xpReward: 140, hasQuiz: false, estimatedTime: '25 min', keyTakeaways: ['ERC-20, EIP-1559, EIP-4844—what changed and why'] },
          { id: 8, title: 'Reading EIPs Like a Pro', type: 'reading', duration: 15, difficulty: 'Easy', xpReward: 90, hasQuiz: false, estimatedTime: '15 min', keyTakeaways: ['How to skim, understand motivation, and evaluate specification'] },
          { id: 9, title: 'Draft Your First EIP', type: 'project', duration: 45, difficulty: 'Hard', xpReward: 200, hasQuiz: false, estimatedTime: '45 min', keyTakeaways: ['Hands-on drafting, proposal builder, submission checklist'] }
        ]
      }
    ]
  },
  {
    id: 'ens-101',
    title: 'ENS 101: Ethereum Name Service Essentials',
    description: 'Learn how Ethereum Name Service works, register names, integrate with dApps, and build ENS-powered apps.',
    level: 'Beginner',
    learningPath: 'Fundamentals',
    duration: '2 hours',
    students: 900,
    rating: 4.7,
    price: 'Free',
    badge: 'ENS Pro NFT',
    topics: ['ENS', 'Domains', 'Web3', 'Integration'],
    href: '/courses/ens-101',
    available: true,
    prerequisites: [{ courseId: 'eips-101', courseName: 'EIPs 101', required: false }],
    totalLessons: 4,
    estimatedTotalTime: '2 hours',
    learningOutcomes: [
      'Understand ENS architecture',
      'Register and manage ENS names',
      'Integrate ENS in dApps',
      'Build ENS-powered applications'
    ],
    skillsGained: ['ENS Integration', 'Domain Management', 'Web3 UX', 'dApp Development'],
    nextRecommendedCourse: '0g-101',
    difficultyMilestones: [
      { percentage: 25, reward: 'ENS Novice', message: '🌐 You\'re learning ENS! 25% complete' },
      { percentage: 50, reward: 'ENS Pro (Silver)', message: '⭐ Halfway to ENS mastery! 50% complete' },
      { percentage: 75, reward: 'ENS Expert', message: '🚀 Almost there! 75% complete' },
      { percentage: 100, reward: 'ENS Pro NFT', message: '🏆 You\'re an ENS Pro! 100% complete' }
    ],
    modules: [
      {
        id: 1,
        title: 'ENS Fundamentals',
        description: 'Learn ENS basics',
        estimatedTime: '45 min',
        lessons: []
      }
    ]
  },
  {
    id: '0g-101',
    title: '0G 101: AI-Native Blockchain Infrastructure',
    description: 'Master 0G\'s decentralized AI stack - storage, compute, and inference for next-generation blockchain applications.',
    level: 'Beginner',
    learningPath: 'Infrastructure',
    duration: '4 hours',
    students: 320,
    rating: 4.9,
    price: 'Free',
    badge: '0G Infrastructure NFT',
    topics: ['0G', 'AI Infrastructure', 'Decentralized Storage', 'GPU Networks'],
    href: '/courses/0g-101',
    available: true,
    prerequisites: [{ courseId: 'eips-101', courseName: 'EIPs 101', required: false }],
    totalLessons: 10,
    estimatedTotalTime: '4 hours',
    learningOutcomes: [
      'Understand 0G\'s AI-native architecture',
      'Work with decentralized storage',
      'Use the compute network for inference',
      'Build AI-powered dApps'
    ],
    skillsGained: ['AI Infrastructure', 'Decentralized Storage', 'Compute Networks', 'AI Integration'],
    nextRecommendedCourse: 'solidity-dev',
    difficultyMilestones: [
      { percentage: 25, reward: '0G Explorer', message: '🌟 25% of your 0G journey!' },
      { percentage: 50, reward: '0G Builder', message: '⚡ 50% complete - Keep going!' },
      { percentage: 75, reward: '0G Expert', message: '🚀 75% - Almost there!' },
      { percentage: 100, reward: '0G Infrastructure NFT', message: '🏆 You\'re a 0G Master!' }
    ],
    modules: [
      {
        id: 1,
        title: 'Introduction to 0G',
        description: 'AI-native blockchain fundamentals',
        estimatedTime: '1 hour',
        lessons: []
      }
    ]
  },
  {
    id: 'blockchain-basics',
    title: 'Blockchain Fundamentals',
    description: 'Understand how blockchain works, from cryptographic hashing to consensus mechanisms.',
    level: 'Beginner',
    learningPath: 'Fundamentals',
    duration: '4-5 hours',
    students: 2500,
    rating: 4.9,
    price: 'Free',
    badge: 'Blockchain Foundation NFT',
    topics: ['Hashing', 'Merkle Trees', 'Consensus', 'Mining vs Staking'],
    href: '/courses/blockchain-basics',
    available: false,
    prerequisites: [],
    totalLessons: 12,
    estimatedTotalTime: '4-5 hours',
    learningOutcomes: [
      'Understand cryptographic fundamentals',
      'Learn consensus mechanisms',
      'Understand merkle trees and hashing',
      'Compare PoW vs PoS'
    ],
    skillsGained: ['Cryptography', 'Consensus Mechanisms', 'Distributed Systems', 'Blockchain Architecture'],
    nextRecommendedCourse: 'eips-101',
    difficultyMilestones: [
      { percentage: 25, reward: 'Crypto Novice', message: '🔐 25% complete!' },
      { percentage: 50, reward: 'Block Builder', message: '⛓️ 50% - Halfway there!' },
      { percentage: 75, reward: 'Consensus Expert', message: '🔗 75% complete!' },
      { percentage: 100, reward: 'Blockchain Foundation NFT', message: '🏆 Blockchain Master!' }
    ],
    modules: []
  },
  {
    id: 'solidity-dev',
    title: 'Smart Contract Development',
    description: 'Build and deploy your first smart contracts using Solidity and modern tooling.',
    level: 'Intermediate',
    learningPath: 'Development',
    duration: '8-10 hours',
    students: 950,
    rating: 4.7,
    price: 'Premium',
    badge: 'Smart Contract Developer NFT',
    topics: ['Solidity Syntax', 'Testing', 'Deployment', 'Security'],
    href: '/courses/solidity-dev',
    available: false,
    prerequisites: [{ courseId: 'eips-101', courseName: 'EIPs 101', required: true }],
    totalLessons: 16,
    estimatedTotalTime: '8-10 hours',
    learningOutcomes: [
      'Write Solidity smart contracts',
      'Understand gas optimization',
      'Deploy to testnets',
      'Test contracts thoroughly'
    ],
    skillsGained: ['Solidity', 'Smart Contracts', 'Testing', 'Deployment', 'Gas Optimization'],
    nextRecommendedCourse: 'web3-security',
    difficultyMilestones: [
      { percentage: 25, reward: 'Solidity Novice', message: '💻 25% - Getting started!' },
      { percentage: 50, reward: 'Contract Developer', message: '📝 50% - Halfway!' },
      { percentage: 75, reward: 'Solidity Expert', message: '⚙️ 75% - Final stretch!' },
      { percentage: 100, reward: 'Smart Contract Developer NFT', message: '🏆 Master Developer!' }
    ],
    modules: []
  },
  {
    id: 'defi-protocols',
    title: 'DeFi Protocol Analysis',
    description: 'Analyze major DeFi protocols, understand yield farming, and liquidity mechanics.',
    level: 'Advanced',
    learningPath: 'Development',
    duration: '6-8 hours',
    students: 680,
    rating: 4.6,
    price: 'Premium',
    badge: 'DeFi Analyst NFT',
    topics: ['AMMs', 'Yield Farming', 'Governance', 'Risk Assessment'],
    href: '/courses/defi-protocols',
    available: false,
    prerequisites: [
      { courseId: 'eips-101', courseName: 'EIPs 101', required: true },
      { courseId: 'solidity-dev', courseName: 'Smart Contract Development', required: true }
    ],
    totalLessons: 14,
    estimatedTotalTime: '6-8 hours',
    learningOutcomes: [
      'Analyze DeFi protocol mechanics',
      'Understand AMM models',
      'Risk assessment frameworks',
      'Yield optimization strategies'
    ],
    skillsGained: ['DeFi Analysis', 'AMM Models', 'Risk Assessment', 'Protocol Design'],
    nextRecommendedCourse: undefined,
    difficultyMilestones: [
      { percentage: 25, reward: 'DeFi Explorer', message: '💰 25% - DeFi discovery!' },
      { percentage: 50, reward: 'Protocol Analyst', message: '📊 50% - Analyzing protocols!' },
      { percentage: 75, reward: 'DeFi Expert', message: '🎯 75% - Expert level!' },
      { percentage: 100, reward: 'DeFi Analyst NFT', message: '🏆 DeFi Master!' }
    ],
    modules: []
  },
  {
    id: 'nft-ecosystem',
    title: 'NFT Standards & Marketplaces',
    description: 'Deep dive into ERC-721, ERC-1155, and the NFT ecosystem including marketplaces.',
    level: 'Intermediate',
    learningPath: 'Development',
    duration: '5-6 hours',
    students: 1100,
    rating: 4.5,
    price: 'Free',
    badge: 'NFT Specialist NFT',
    topics: ['ERC Standards', 'Metadata', 'Marketplaces', 'Royalties'],
    href: '/courses/nft-ecosystem',
    available: false,
    prerequisites: [{ courseId: 'eips-101', courseName: 'EIPs 101', required: false }],
    totalLessons: 12,
    estimatedTotalTime: '5-6 hours',
    learningOutcomes: [
      'Understand ERC-721 and ERC-1155',
      'Design NFT metadata',
      'Integrate with marketplaces',
      'Implement royalties'
    ],
    skillsGained: ['ERC Standards', 'NFT Design', 'Marketplace Integration', 'Royalty Mechanisms'],
    nextRecommendedCourse: 'solidity-dev',
    difficultyMilestones: [
      { percentage: 25, reward: 'NFT Explorer', message: '🎨 25% - NFT journey begins!' },
      { percentage: 50, reward: 'NFT Minter', message: '🖼️ 50% - Building NFTs!' },
      { percentage: 75, reward: 'NFT Developer', message: '✨ 75% - Almost expert!' },
      { percentage: 100, reward: 'NFT Specialist NFT', message: '🏆 NFT Master!' }
    ],
    modules: []
  },
  {
    id: 'web3-security',
    title: 'Web3 Security Fundamentals',
    description: 'Learn to identify and prevent common smart contract vulnerabilities and exploits.',
    level: 'Advanced',
    learningPath: 'Development',
    duration: '7-9 hours',
    students: 425,
    rating: 4.9,
    price: 'Premium',
    badge: 'Security Auditor NFT',
    topics: ['Reentrancy', 'Flash Loans', 'Governance Attacks', 'Best Practices'],
    href: '/courses/web3-security',
    available: false,
    prerequisites: [
      { courseId: 'solidity-dev', courseName: 'Smart Contract Development', required: true }
    ],
    totalLessons: 15,
    estimatedTotalTime: '7-9 hours',
    learningOutcomes: [
      'Identify smart contract vulnerabilities',
      'Understand attack vectors',
      'Perform security audits',
      'Implement security best practices'
    ],
    skillsGained: ['Security Auditing', 'Vulnerability Analysis', 'Best Practices', 'Smart Contract Safety'],
    nextRecommendedCourse: undefined,
    difficultyMilestones: [
      { percentage: 25, reward: 'Security Novice', message: '🔒 25% - Security basics!' },
      { percentage: 50, reward: 'Vulnerability Hunter', message: '🔍 50% - Finding exploits!' },
      { percentage: 75, reward: 'Security Expert', message: '⚔️ 75% - Expert level!' },
      { percentage: 100, reward: 'Security Auditor NFT', message: '🏆 Security Master!' }
    ],
    modules: []
  }
];

// Learning paths for structure
export const learningPaths = {
  'Fundamentals': {
    title: 'Web3 Fundamentals',
    description: 'Start your Web3 journey with the basics',
    courses: ['eips-101', 'ens-101', 'blockchain-basics'],
    icon: '📚',
    order: 1
  },
  'Infrastructure': {
    title: 'Blockchain Infrastructure',
    description: 'Learn how blockchain systems are built',
    courses: ['0g-101', 'solidity-dev'],
    icon: '⚙️',
    order: 2
  },
  'Development': {
    title: 'Smart Contract Development',
    description: 'Build decentralized applications',
    courses: ['solidity-dev', 'nft-ecosystem', 'defi-protocols', 'web3-security'],
    icon: '💻',
    order: 3
  }
};

// Helper function to get course by ID
export function getCourseById(courseId: string): EnhancedCourse | undefined {
  return coursesWithPath.find(c => c.id === courseId);
}

// Helper function to check if user can access a course
export function canAccessCourse(courseId: string, completedCourses: string[]): { canAccess: boolean; missingPrerequisites: Prerequisite[] } {
  const course = getCourseById(courseId);
  if (!course) return { canAccess: false, missingPrerequisites: [] };

  const missingRequired = course.prerequisites.filter(
    prereq => prereq.required && !completedCourses.includes(prereq.courseId)
  );

  return {
    canAccess: missingRequired.length === 0,
    missingPrerequisites: missingRequired
  };
}

// Get recommended next course
export function getRecommendedNextCourse(completedCourses: string[]): EnhancedCourse | undefined {
  for (const course of coursesWithPath) {
    if (!completedCourses.includes(course.id) && course.available) {
      const { canAccess } = canAccessCourse(course.id, completedCourses);
      if (canAccess) return course;
    }
  }
  return undefined;
}
