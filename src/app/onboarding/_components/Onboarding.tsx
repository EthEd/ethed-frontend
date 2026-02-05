"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Confetti from "react-confetti";
import {
  Sparkles,
  PawPrint,
  BadgeCheck,
  ArrowRight,
  Heart,
  Globe,
  Gift,
  MessageCircle,
  Wallet,
  Crown,
  Star,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useENSLookup } from "@/hooks/use-ens-lookup";

interface Buddy {
  id: string;
  name: string;
  emoji: string;
  personality: string;
  greeting: string;
  traits: string[];
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

interface ChatMessage {
  id: string;
  sender: "buddy" | "user";
  message: string;
  timestamp: Date;
  emotion?: "happy" | "excited" | "proud" | "encouraging";
}

const buddyOptions: Buddy[] = [
  {
    id: "spark-dragon",
    name: "Spark",
    emoji: "🐉",
    personality: "Wise Mentor",
    greeting: "Greetings, future scholar! I'm Spark, your dragon guide. Together, we'll unlock the mysteries of knowledge! 🔥✨",
    traits: ["Wisdom", "Leadership", "Ancient Knowledge"],
    rarity: "Legendary",
  },
  {
    id: "cyber-fox",
    name: "Cypher",
    emoji: "🦊",
    personality: "Tech Genius",
    greeting: "Hey there, code explorer! I'm Cypher, and I live in the digital realm. Ready to hack some knowledge? 💻⚡",
    traits: ["Innovation", "Quick Learning", "Problem Solving"],
    rarity: "Epic",
  },
  {
    id: "prof-owl",
    name: "Professor Hoot",
    emoji: "🦉",
    personality: "Academic Scholar",
    greeting: "Greetings, my dear student! Professor Hoot at your service. Knowledge is power, and we shall gather plenty! 📚🎓",
    traits: ["Research", "Analysis", "Deep Thinking"],
    rarity: "Rare",
  },
  {
    id: "cosmic-cat",
    name: "Luna",
    emoji: "🐱",
    personality: "Creative Explorer",
    greeting: "Meow! I'm Luna, your cosmic companion! Let's explore the universe of learning together! 🌟🚀",
    traits: ["Creativity", "Curiosity", "Independence"],
    rarity: "Common",
  },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "Legendary": return "from-yellow-400 to-orange-500";
    case "Epic": return "from-purple-400 to-pink-500";
    case "Rare": return "from-blue-400 to-cyan-500";
    default: return "from-green-400 to-emerald-500";
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case "Legendary": return <Crown className="w-4 h-4" />;
    case "Epic": return <Star className="w-4 h-4" />;
    case "Rare": return <Zap className="w-4 h-4" />;
    default: return <Heart className="w-4 h-4" />;
  }
};

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lookupByAddress } = useENSLookup();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      toast.error("Please sign in to access onboarding");
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  const BUDDY_ENABLED = false; // Temporarily disable Learning Buddy for MVP

  const [step, setStep] = useState(0);
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [ensName, setEnsName] = useState("");
  const [ensAvailable, setEnsAvailable] = useState<boolean | null>(null);
  const [ensChecking, setEnsChecking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [nftsMinted, setNftsMinted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [createdPet, setCreatedPet] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Auto-generate initial ENS name
  useEffect(() => {
    if (session?.user && !ensName) {
      let baseName = '';
      
      if (session.address) {
        // For wallet users, use address-based name
        baseName = `learner-${session.address.slice(-4)}`;
      } else if (session.user.name) {
        // For social users, use their name
        baseName = session.user.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      } else if (session.user.email) {
        // Use email username
        baseName = session.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      } else {
        // Fallback random name
        baseName = `learner-${Math.random().toString(36).substring(2, 6)}`;
      }
      
      // Ensure it meets validation rules
      if (baseName.length < 3) {
        baseName = `user-${Math.random().toString(36).substring(2, 6)}`;
      }
      
      setEnsName(baseName);
    }
  }, [session, ensName]);

  // Validate ENS name
  const validateEnsName = (name: string) => {
    if (!name) return { valid: false, message: "ENS name is required" };
    if (name.length < 3) return { valid: false, message: "ENS name must be at least 3 characters" };
    if (name.length > 20) return { valid: false, message: "ENS name must be 20 characters or less" };
    if (!/^[a-z0-9-]+$/.test(name)) return { valid: false, message: "Only lowercase letters, numbers, and hyphens allowed" };
    if (name.startsWith('-') || name.endsWith('-')) return { valid: false, message: "Cannot start or end with hyphen" };
    if (name.includes('--')) return { valid: false, message: "Cannot contain consecutive hyphens" };
    
    const reserved = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'ethed', 'test'];
    if (reserved.includes(name)) return { valid: false, message: "This name is reserved" };
    
    return { valid: true, message: "Valid ENS name" };
  };

  const ensValidation = validateEnsName(ensName);

  // Update progress
  useEffect(() => {
    setProgress((step / 4) * 100);
  }, [step]);

  // Initialize chat when buddy is selected
  useEffect(() => {
    if (!BUDDY_ENABLED) return;

    if (step === 1 && chatMessages.length === 0 && selectedBuddy) {
      const welcomeMessage: ChatMessage = {
        id: "1",
        sender: "buddy",
        message: selectedBuddy?.greeting || "Hello! Let's get started.",
        timestamp: new Date(),
        emotion: "happy",
      };
      setChatMessages([welcomeMessage]);
    }
  }, [step, selectedBuddy, chatMessages.length]);

  // Check ENS availability when name changes
  useEffect(() => {
    const checkENSAvailability = async () => {
      if (ensName.length < 3) {
        setEnsAvailable(null);
        return;
      }

      setEnsChecking(true);
      try {
        const response = await fetch(`/api/ens/lookup?name=${encodeURIComponent(ensName)}`);
        const data = await response.json();
        setEnsAvailable(true);
      } catch (error) {
        console.error("ENS availability check failed:", error);
        setEnsAvailable(null);
      } finally {
        setEnsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkENSAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [ensName]);

  const handleBuddySelect = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    const selectMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "buddy",
      message: buddy.greeting,
      timestamp: new Date(),
      emotion: "excited",
    };
    setChatMessages([selectMessage]);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: userInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    // Simulate buddy response
    setTimeout(() => {
      const responses = [
        "That's amazing! Your curiosity is exactly what makes a great learner! 🌟",
        "I love your enthusiasm! We're going to have so much fun learning together! 🎉",
        "Great question! That shows you're already thinking like a scholar! 📚",
        "Perfect! Your eagerness to learn makes my digital heart happy! 💖",
        "Excellent! I can tell you're going to be one of my favorite students! ⭐",
      ];

      const buddyResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "buddy",
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        emotion: "encouraging",
      };

      setChatMessages((prev) => [...prev, buddyResponse]);

      // Award NFT for interaction
      if (chatMessages.length >= 2 && !nftsMinted.includes("interaction")) {
        setTimeout(() => {
          setNftsMinted((prev) => [...prev, "interaction"]);
          toast.success("🎁 New NFT Unlocked: First Chat Interaction!");
        }, 1000);
      }
    }, 1500);
  };

  const createPetInBackend = async () => {
    if (!BUDDY_ENABLED || !selectedBuddy) {
      toast.info("Learning Buddy feature is currently disabled.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/user/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedBuddy?.name,
          petType: selectedBuddy?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error("Please sign in to create your learning buddy");
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to create pet");
      }

      setCreatedPet(data.pet);
      
      const petMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "buddy",
        message: `🎉 Wonderful! I'm now officially your learning companion! Let's continue setting up your EthEd identity!`,
        timestamp: new Date(),
        emotion: "excited",
      };

      setChatMessages((prev) => [...prev, petMessage]);
      toast.success(`${selectedBuddy?.name || 'Buddy'} is now your learning buddy!`);
      
      setTimeout(() => setStep(2), 1500);

    } catch (error: any) {
      console.error("Pet creation error:", error);
      toast.error(error.message || "Failed to create pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerENSSubdomain = async () => {
    if (!ensValidation.valid) {
      toast.error(ensValidation.message);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/ens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: ensName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register ENS");
      }

      const ensMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "buddy",
        message: `🎉 Congratulations! Your ENS name ${ensName}.ethed.eth has been registered! You now have your unique identity in the EthEd ecosystem!`,
        timestamp: new Date(),
        emotion: "proud",
      };

      setChatMessages((prev) => [...prev, ensMessage]);
      setNftsMinted((prev) => [...prev, "ens-pioneer"]);
      toast.success(`🌐 ENS ${ensName}.ethed.eth registered successfully!`);
      
      setTimeout(() => setStep(3), 1500);

    } catch (error: any) {
      console.error("ENS registration error:", error);
      toast.error(error.message || "Failed to register ENS. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const mintGenesisNFTs = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/user/nfts/genesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ensName: `${ensName}.ethed.eth`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          toast.error("Please sign in to mint your NFTs");
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to mint NFTs");
      }

      console.log("NFT minting successful:", data);

      setShowConfetti(true);
      setNftsMinted((prev) => [...prev, "genesis-scholar", "buddy-bond"]);

      const nftMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "buddy",
        message: `🏆 Amazing! You've just minted your Genesis Scholar NFT and our Buddy Bond NFT! These represent the beginning of your incredible learning journey with me!`,
        timestamp: new Date(),
        emotion: "excited",
      };

      setChatMessages((prev) => [...prev, nftMessage]);
      toast.success("🎉 Genesis NFTs minted successfully!");

      setTimeout(() => {
        setShowConfetti(false);
        setStep(4);
      }, 4000);

    } catch (error: any) {
      console.error("NFT minting error:", error);
      toast.error(error.message || "Failed to mint NFTs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onboardingCompleted: true,
          ensName: `${ensName}.ethed.eth`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await updateUserProfile();
      
      toast.success("Welcome to EthEd! Your journey begins now.", {
        duration: 5000,
      });
      
      router.push("/learn");
    } catch (error: any) {
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -300 },
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      <div className="w-full max-w-4xl">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Welcome to EthEd 🚀
            </h1>
            <Badge variant="outline" className="text-slate-300">
              Step {step + 1} of 5
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 0: Welcome */}
              {step === 0 && (
                <motion.div
                  key="welcome"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full">
                    <CardHeader className="text-center pb-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-white">
                        Let's Begin Your Learning Adventure! 🌟
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-slate-300 text-center text-lg">
                        Welcome to EthEd - where learning meets blockchain technology!
                        You're about to embark on an incredible journey of knowledge and growth.
                      </p>
                      
                      {session?.user && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-emerald-400 font-medium">
                                Signed in as {session.user.name || session.user.email}
                              </p>
                              {session.address && (
                                <p className="text-xs text-slate-400">
                                  Wallet: {session.address.slice(0, 6)}...{session.address.slice(-4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <PawPrint className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-300">Meet Your Buddy</p>
                        </div>
                        <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <Globe className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-300">Get ENS Identity</p>
                        </div>
                        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-300">Mint NFTs</p>
                        </div>
                      </div>
                      
                      <Button onClick={() => setStep(BUDDY_ENABLED ? 1 : 2)} size="lg" className="w-full">
                        Start My Journey <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 1: Buddy Selection */}
              {BUDDY_ENABLED && step === 1 && (
                <motion.div
                  key="buddy"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white flex items-center">
                        <PawPrint className="w-6 h-6 mr-2 text-emerald-400" />
                        Choose Your Learning Buddy 🐾
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {buddyOptions.map((buddy) => (
                          <motion.div
                            key={buddy.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBuddySelect(buddy)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedBuddy?.id === buddy.id
                                ? "border-emerald-400 bg-emerald-500/10"
                                : "border-slate-600 hover:border-slate-500"
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-3xl mb-2">{buddy.emoji}</div>
                              <h3 className="font-semibold text-white text-sm">
                                {buddy.name}
                              </h3>
                              <p className="text-xs text-slate-400 mb-2">
                                {buddy.personality}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs bg-gradient-to-r ${getRarityColor(buddy.rarity)}`}
                              >
                                {getRarityIcon(buddy.rarity)}
                                <span className="ml-1">{buddy.rarity}</span>
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {chatMessages.length > 0 && (
                        <div className="mt-4">
                          <Button
                            onClick={createPetInBackend}
                            size="lg"
                            className="w-full"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating {selectedBuddy?.name || 'Buddy'}...
                              </div>
                            ) : (
                              <>
                                Continue with {selectedBuddy?.name || 'Buddy'} <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: ENS Registration */}
              {step === 2 && (
                <motion.div
                  key="ens"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white flex items-center">
                        <Globe className="w-6 h-6 mr-2 text-cyan-400" />
                        Claim Your ENS Identity 🌐
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="ens-name"
                          className="text-white font-medium"
                        >
                          Your Unique EthEd Identity
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="ens-name"
                            value={ensName}
                            onChange={(e) => {
                              const value = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "")
                                .replace(/^-+|-+$/g, "")
                                .replace(/--+/g, "-");
                              setEnsName(value);
                            }}
                            placeholder="your-name"
                            className={`flex-1 bg-slate-700/50 border-slate-600 ${
                              ensName && !ensValidation.valid ? 'border-red-500' : 
                              ensName && ensValidation.valid ? 'border-green-500' : ''
                            }`}
                            maxLength={20}
                            minLength={3}
                          />
                          <span className="text-slate-400 font-mono">
                            .ethed.eth
                          </span>
                        </div>
                        {ensName && (
                          <p className={`text-xs ${ensValidation.valid ? 'text-green-400' : 'text-red-400'}`}>
                            {ensValidation.message}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          3-20 characters, lowercase letters, numbers, and hyphens only. Cannot start/end with hyphen.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{selectedBuddy?.emoji || '🧑‍🎓'}</div>
                          <div>
                            <p className="text-cyan-400 font-semibold">
                              {ensName}.ethed.eth
                            </p>
                            <p className="text-slate-400 text-sm">
                              Protected by {selectedBuddy?.name || 'EthEd Team'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={registerENSSubdomain}
                        size="lg"
                        className="w-full"
                        disabled={!ensName.trim() || !ensValidation.valid || isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Reserving ENS...
                          </div>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Reserve My ENS Name
                          </>
                        )}
                      </Button>

                      {ensAvailable === false && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          <AlertDescription className="text-sm">
                            This ENS name is already taken. Please choose another name.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: NFT Minting */}
              {step === 3 && (
                <motion.div
                  key="nft"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white flex items-center">
                        <Gift className="w-6 h-6 mr-2 text-purple-400" />
                        Mint Your Genesis NFTs 🎁
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 text-center">
                          <div className="text-4xl mb-2">{selectedBuddy?.emoji || '🧑‍🎓'}</div>
                          <h3 className="font-bold text-white text-sm mb-1">
                            Genesis Scholar
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Founder
                          </Badge>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/30 text-center">
                          <div className="text-4xl mb-2">🤝</div>
                          <h3 className="font-bold text-white text-sm mb-1">
                            Buddy Bond
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            Rare
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-300">
                        <p>✨ Exclusive Genesis collection artwork</p>
                        <p>🎯 Special learning bonuses and rewards</p>
                        <p>🏆 Proof of being an early EthEd pioneer</p>
                        <p>💝 Commemorates your bond with {selectedBuddy?.name || 'the EthEd community'}</p>
                      </div>

                      <Button
                        onClick={mintGenesisNFTs}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Minting NFTs...
                          </div>
                        ) : (
                          <>
                            <BadgeCheck className="w-4 h-4 mr-2" />
                            Mint My Genesis NFTs
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Completion */}
              {step === 4 && (
                <motion.div
                  key="complete"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
                    <CardContent className="text-center py-12 space-y-6">
                      <div className="text-6xl mb-4">🎊</div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                        Welcome to EthEd! 🚀
                      </h2>
                      <p className="text-slate-300 text-lg max-w-md mx-auto">
                        Congratulations! You've successfully set up your profile.
                        The EthEd community is excited to guide your learning journey!
                      </p>

                      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                        <div className="p-4 bg-emerald-500/20 rounded-lg">
                          <div className="text-2xl mb-2">{selectedBuddy?.emoji || '🎓'}</div>
                          <p className="text-xs text-slate-400">Learning Buddy</p>
                        </div>
                        <div className="p-4 bg-cyan-500/20 rounded-lg">
                          <div className="text-2xl mb-2">🌐</div>
                          <p className="text-xs text-slate-400">ENS Identity</p>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-400 text-sm font-medium">
                          🎁 {nftsMinted.length} NFTs earned in your collection!
                        </p>
                      </div>

                      <Button
                        onClick={completeOnboarding}
                        size="lg"
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Continue to Learning Hub
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-emerald-400" />
                  {BUDDY_ENABLED ? `Chat with ${selectedBuddy?.name || 'Buddy'}` : 'Onboarding Help'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-96">
                {/* Messages */}
                {!BUDDY_ENABLED && (
                  <div className="text-sm text-slate-300">
                    <p className="mb-2">Learning Buddy is temporarily disabled for the MVP.</p>
                    <p className="mb-2">If you need help with onboarding, use the support link at the bottom of the page or reach out on our community channel.</p>
                    <p className="text-xs text-slate-400">Tip: You can still claim your ENS and mint your Genesis NFT during onboarding.</p>
                  </div>
                )}
                {BUDDY_ENABLED && (
                <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-2">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg text-sm ${
                          msg.sender === "user"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {msg.sender === "buddy" && (
                          <div className="flex items-center mb-1">
                            <span className="text-lg mr-1">{selectedBuddy?.emoji}</span>
                            <span className="text-xs text-slate-400">
                              {selectedBuddy?.name}
                            </span>
                          </div>
                        )}
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                )}

                {/* Input */}
                {step >= 1 && (
                  <div className="flex space-x-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={`Message ${selectedBuddy?.name || 'onboarding help'}...`}
                      className="flex-1 text-sm bg-slate-700/50 border-slate-600"
                      maxLength={200}
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!userInput.trim()}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* NFT Collection Preview */}
        {nftsMinted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-yellow-400" />
                  Your NFT Collection ({nftsMinted.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nftsMinted.map((nft, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
                    >
                      <Gift className="w-3 h-3 mr-1" />
                      {nft
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
