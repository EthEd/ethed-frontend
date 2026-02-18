"use client";
import CourseModulePage from "@/components/CourseModulePage";
import { useParams } from "next/navigation";

const courses = [
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

export default function CoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        return <div>Course not found</div>;
    }

    const lessonsArray = Array.from({ length: course.lessons }, (_, i) => ({
        id: `lesson-${i + 1}`,
        title: `Lesson ${i + 1}: Introduction to ${course.title}`,
        content: `This is the content for lesson ${i + 1}. It's currently a placeholder.`,
        duration: `${Math.floor(Math.random() * 15) + 5} min`,
        type: 'video' as const,
        xpReward: 10 + Math.floor(Math.random() * 30),
        difficulty: (i % 3 === 0 ? 'Beginner' : i % 3 === 1 ? 'Intermediate' : 'Advanced') as 'Beginner' | 'Intermediate' | 'Advanced',
        keyTakeaways: [
          'Core concept overview',
          'Implementation detail',
          'Next steps'
        ]
    }));

    const modules = [
      {
        id: 'module-1',
        title: 'All Lessons',
        description: course.description || '',
        estimatedTime: course.duration || '',
        lessons: lessonsArray,
        rewardBadge: course.nftReward || undefined,
        icon: '📚'
      }
    ];

    return (
      <CourseModulePage
        courseId={course.id}
        courseName={course.title}
        modules={modules}
        totalLessons={lessonsArray.length}
      />
    );
}
