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
    reply: `I understand you asked: "${message}". I'm your eth.ed learning assistant! I can help you with blockchain concepts, smart contracts, and Web3 fundamentals. How can I guide your learning journey today?`,
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
 * Handle "Learn about eth.ed"
 */
async function handleLearnAbout(context: string | undefined, userId: string) {
  const info = {
    title: "Welcome to eth.ed!",
    description:
      "eth.ed is a professional blockchain education platform where you master Ethereum concepts through high-fidelity lessons, earn NFT credentials, and build your Web3 identity.",
    features: [
      {
        icon: "🎓",
        title: "Expert Curriculum",
        description:
          "Learn blockchain depth through structured paths from EIPs to Protocol design",
      },
      {
        icon: "📜",
        title: "NFT Credentials",
        description:
          "Earn unique NFT badges that verify your mastery of specific technical concepts",
      },
      {
        icon: "⚡",
        title: "AI-Powered Learning",
        description:
          "Advanced AI tutoring to answer complex protocol questions in real-time",
      },
      {
        icon: "🌐",
        title: "ENS Identity",
        description:
          "Claim your human-readable .eth identity to build your professional profile",
      },
    ],
    nextSteps: [
      "Complete onboarding to set up your profile",
      "Connect your wallet to track progress",
      "Start your first course to earn your Genesis badge",
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
    message: "Let's begin your Web3 mastery journey!",
    steps: [
      {
        id: "onboarding",
        title: "Set Up Profile",
        description: "Configure your Web3 identity and notification settings",
        status: "pending",
        link: "/onboarding",
      },
      {
        id: "first-course",
        title: "Ethereum Fundamentals",
        description: "Start with the EIPs 101 course to master core principles",
        status: "locked",
        link: "/courses/eips-101",
      },
      {
        id: "first-nft",
        title: "Claim NFT Achievement",
        description: "Complete your first module to mint a credential",
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
      title: "About Credentials",
      content:
        "NFT credentials on eth.ed represent your learning milestones. Each achievement is a unique digital proof stored on-chain, verifying your knowledge of specific Ethereum standards.",
    },
    ens: {
      title: "About ENS Names",
      content:
        "ENS (Ethereum Name Service) provides human-readable names for Ethereum. On eth.ed, you can use your ENS to build a persistent educational track record.",
    },
    default: {
      title: "eth.ed Platform",
      content:
        "eth.ed combines professional curriculum, NFT credentials, and AI assistance to build the next generation of Ethereum developers.",
    },
  };

  const info = infoMap[context || "default"] || infoMap.default;
  return NextResponse.json(info);
}
