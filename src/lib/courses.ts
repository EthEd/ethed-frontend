export interface Course {
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
  modules?: any[]; // For CourseModulePage
}

export const courses: Course[] = [
  {
    id: "ens-101",
    title: "ENS 101: Ethereum Name Service Essentials",
    description: "Master the Ethereum Name Service, from registering your first domain to building decentralized identities.",
    difficulty: "Beginner",
    duration: "2 weeks",
    lessons: 4,
    students: 12450,
    rating: 4.9,
    price: "Free",
    category: "Identity",
    tags: ["ENS", "Identity", "Domains", "Web3"],
    instructor: "Ayush Shetty",
    thumbnail: "/courses/ens-101.jpg",
    isPopular: true,
    progress: 0,
    nftReward: "ENS Explorer NFT"
  },
  {
    id: "eips-101",
    title: "EIPs 101: Principles to Proposals",
    description: "Understand the Ethereum Improvement Proposal process and learn how to contribute to the core protocol.",
    difficulty: "Intermediate",
    duration: "3 weeks",
    lessons: 9,
    students: 8420,
    rating: 4.8,
    price: "Free",
    category: "Protocol",
    tags: ["EIP", "Ethereum", "Governance", "Core"],
    instructor: "Nick Johnson",
    thumbnail: "/courses/eips-101.jpg",
    isNew: true,
    progress: 0,
    nftReward: "Protocol Pioneer NFT"
  },
  {
    id: "0g-101",
    title: "0G 101: AI-Native Stack",
    description: "Learn about the 0G protocol and how to build high-performance, AI-integrated decentralized applications.",
    difficulty: "Advanced",
    duration: "4 weeks",
    lessons: 12,
    students: 5670,
    rating: 4.9,
    price: "Free",
    category: "AI",
    tags: ["0G", "DA", "AI", "Infrastructure"],
    instructor: "Conflux Team",
    thumbnail: "/courses/0g-101.jpg",
    isNew: true,
    progress: 0,
    nftReward: "0G Innovator NFT"
  },
  {
    id: "blockchain-basics",
    title: "Blockchain Fundamentals",
    description: "Master the core concepts of blockchain technology, from cryptographic hashing to consensus mechanisms.",
    difficulty: "Beginner",
    duration: "4 weeks",
    lessons: 12,
    students: 15420,
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
    title: "Smart Contract Development",
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
    progress: 0,
    nftReward: "Solidity Master NFT"
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
  }
];
