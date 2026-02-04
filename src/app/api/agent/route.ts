/**
 * Agent API endpoint
 * Handles agent interactions, questions, and triggers actions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to use the agent" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, message, context } = body;

    console.log(`Agent action requested by ${session.user.email}:`, {
      action,
      message,
      context,
    });

    // Handle different agent actions
    switch (action) {
      case "ask":
        return await handleAskQuestion(message, session.user.id);

      case "learn":
        return await handleLearnAbout(context, session.user.id);

      case "start":
        return await handleStartJourney(session.user.id);

      case "info":
        return await handleGetInfo(context);

      default:
        return NextResponse.json(
          { error: "Unknown action type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle "Ask me anything" questions
 */
async function handleAskQuestion(message: string, userId: string) {
  // TODO: In production, integrate with AI service (OpenAI, Claude, etc.)
  // For now, return a mock response

  const response = {
    reply: `I understand you asked: "${message}". I'm your EthEd learning assistant! I can help you with blockchain concepts, smart contracts, and Web3 fundamentals. How can I guide your learning journey today?`,
    suggestions: [
      "What is Ethereum?",
      "How do smart contracts work?",
      "Explain gas fees",
      "What is a wallet?",
    ],
    userId,
  };

  return NextResponse.json(response);
}

/**
 * Handle "Learn about EthEd"
 */
async function handleLearnAbout(context: string | undefined, userId: string) {
  const info = {
    title: "Welcome to EthEd!",
    description:
      "EthEd is an interactive blockchain education platform where you learn Web3 concepts through gamified lessons, earn NFT achievements, and track your progress with your personalized learning buddy.",
    features: [
      {
        icon: "🎓",
        title: "Interactive Courses",
        description:
          "Learn blockchain fundamentals through hands-on lessons and real-world examples",
      },
      {
        icon: "🎯",
        title: "NFT Achievements",
        description:
          "Earn unique NFT badges as you complete milestones and master new skills",
      },
      {
        icon: "🤖",
        title: "AI Learning Buddy",
        description:
          "Your personal guide that grows with you throughout your learning journey",
      },
      {
        icon: "🌐",
        title: "ENS Identity",
        description:
          "Get your own .ethed.eth name to build your Web3 identity",
      },
    ],
    nextSteps: [
      "Complete onboarding to get your Genesis Scholar NFT",
      "Choose your learning buddy",
      "Start your first course",
    ],
    userId,
  };

  return NextResponse.json(info);
}

/**
 * Handle "Start Learning Journey"
 */
async function handleStartJourney(userId: string) {
  // Check user's progress and recommend next steps

  const journey = {
    message: "Let's begin your Web3 learning adventure!",
    steps: [
      {
        id: "onboarding",
        title: "Complete Onboarding",
        description: "Set up your profile and choose your learning buddy",
        status: "pending",
        link: "/onboarding",
      },
      {
        id: "first-course",
        title: "Blockchain Basics",
        description: "Start with the fundamentals of blockchain technology",
        status: "locked",
        link: "/courses/blockchain-basics",
      },
      {
        id: "first-nft",
        title: "Mint Your First Achievement",
        description: "Complete your first lesson to earn an NFT badge",
        status: "locked",
        link: "/learn",
      },
    ],
    userId,
  };

  return NextResponse.json(journey);
}

/**
 * Handle general info requests
 */
async function handleGetInfo(context: string | undefined) {
  const infoMap: Record<string, any> = {
    nft: {
      title: "About NFT Achievements",
      content:
        "NFTs (Non-Fungible Tokens) on EthEd represent your learning milestones. Each achievement is a unique digital collectible stored on the blockchain, proving your knowledge and progress.",
    },
    ens: {
      title: "About ENS Names",
      content:
        "ENS (Ethereum Name Service) gives you a human-readable name like yourname.ethed.eth instead of a long wallet address. It's your Web3 identity!",
    },
    buddy: {
      title: "About Learning Buddies",
      content:
        "Your Learning Buddy is an AI companion that guides you through lessons, answers questions, and celebrates your achievements. Choose from Spark Dragon, Cyber Fox, Prof Owl, or Cosmic Cat!",
    },
    default: {
      title: "EthEd Platform",
      content:
        "EthEd combines gamified learning, NFT achievements, and AI tutoring to make blockchain education engaging and rewarding.",
    },
  };

  const info = infoMap[context || "default"] || infoMap.default;
  return NextResponse.json(info);
}
