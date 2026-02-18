"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Confetti from "react-confetti";
import {
  Sparkles,
  BadgeCheck,
  ArrowRight,
  Globe,
  Gift,
  Crown,
  Star,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      toast.error("Please sign in to access onboarding");
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  const [step, setStep] = useState(0);

  // Fetch initial onboarding step
  useEffect(() => {
    const fetchStep = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (data.user?.onboardingStep) {
          setStep(data.user.onboardingStep);
        }
      } catch {
        // onboarding step fetch failed — default to step 0
      }
    };
    if (session) fetchStep();
  }, [session]);

  const changeStep = async (newStep: number) => {
    setStep(newStep);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStep: newStep }),
      });
    } catch {
      // step persist failed — non-blocking
    }
  };
  const [ensName, setEnsName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [nftsMinted, setNftsMinted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);


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
    setProgress((step / 3) * 100);
  }, [step]);

  // Check ENS availability when name changes
  useEffect(() => {
    const checkENSAvailability = async () => {
      if (ensName.length < 3) {
        return;
      }

      try {
        await fetch(`/api/ens/lookup?name=${encodeURIComponent(ensName)}`);
      } catch {
        // ignore lookup errors
      }
    };

    const debounceTimer = setTimeout(checkENSAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [ensName]);

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

      setNftsMinted((prev) => [...prev, "ens-pioneer"]);
      toast.success(`🌐 ENS ${ensName}.ethed.eth registered successfully!`);
      
      setTimeout(() => changeStep(2), 1500);

    } catch (error: any) {
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

      setShowConfetti(true);
      setNftsMinted((prev) => [...prev, "pioneer-scholar"]);

      toast.success("🎉 Pioneer NFT minted successfully!");

      setTimeout(() => {
        setShowConfetti(false);
        changeStep(3);
      }, 4000);

    } catch (error: any) {
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
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await updateUserProfile();
      
      toast.success("Welcome to eth.ed! Your journey begins now.", {
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      <div className="w-full max-w-4xl z-10">
        {/* Header with Progress */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Setup Your Identity
              </h1>
              <p className="text-slate-400">Complete these steps to start your journey.</p>
            </div>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 px-3 py-1">
              Step {step + 1} of 4
            </Badge>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div
                key="welcome"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/5 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <CardContent className="pt-10 pb-10 px-8 text-center">
                    <div className="mx-auto w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-8 rotate-3 border border-cyan-500/20">
                      <Sparkles className="w-12 h-12 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Welcome to eth.ed 🚀
                    </h2>
                    <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                      You're about to join a community of lifelong learners 
                      building the future of decentralized education.
                    </p>
                    
                    {session?.user && (
                      <div className="p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-xl mb-10 text-left flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Authenticated as {session.user.name || session.user.email}
                          </p>
                          <p className="text-sm text-slate-400 font-mono">
                            {session.address ? `${session.address.slice(0, 6)}...${session.address.slice(-4)}` : "Verified Explorer"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="text-left p-5 bg-slate-800/30 rounded-xl border border-white/5">
                        <Globe className="w-6 h-6 text-cyan-400 mb-3" />
                        <h3 className="text-white font-semibold mb-1">Web3 Identity</h3>
                        <p className="text-sm text-slate-400">Claim your unique .ethed.eth name</p>
                      </div>
                      <div className="text-left p-5 bg-slate-800/30 rounded-xl border border-white/5">
                        <Gift className="w-6 h-6 text-blue-400 mb-3" />
                        <h3 className="text-white font-semibold mb-1">Pioneer NFT</h3>
                        <p className="text-sm text-slate-400">Mint your exclusive founder badge</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => changeStep(1)} 
                      size="lg" 
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold h-14 text-lg"
                    >
                      Start My Setup <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 1: ENS Registration */}
            {step === 1 && (
              <motion.div
                key="ens"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/5">
                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <CardHeader className="pt-8 px-8">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        <Globe className="w-6 h-6" />
                      </div>
                      Claim Your ENS Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-10 space-y-8">
                    <div className="space-y-4">
                      <Label htmlFor="ens-name" className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                        Choose Your Subdomain
                      </Label>
                      <div className="relative">
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
                          placeholder="username"
                          className={`h-16 text-xl bg-slate-800/50 border-white/10 pr-32 focus:ring-cyan-500/50 transition-all ${
                            ensName && !ensValidation.valid ? 'border-red-500/50' : 
                            ensName && ensValidation.valid ? 'border-cyan-500/50' : ''
                          }`}
                          maxLength={20}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg pointer-events-none">
                          .ethed.eth
                        </div>
                      </div>
                      {ensName && (
                        <p className={`text-sm flex items-center gap-2 ${ensValidation.valid ? 'text-cyan-400' : 'text-red-400'}`}>
                          {ensValidation.valid ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          {ensValidation.message}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <Sparkles className="w-3 h-3 inline mr-2 text-cyan-400" />
                        This name will be your primary identity across the eth.ed ecosystem. It's yours for free as an early pioneer!
                      </p>
                    </div>

                    <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-xl relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-950">
                          {ensName ? ensName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-cyan-400 font-bold text-xl font-mono">
                            {ensName || "yourname"}.ethed.eth
                          </p>
                          <p className="text-slate-400 text-sm">
                            Identity ready for verification
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={registerENSSubdomain}
                      size="lg"
                      className="w-full h-14 bg-white hover:bg-slate-200 text-slate-950 font-bold text-lg"
                      disabled={!ensName.trim() || !ensValidation.valid || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950 mr-3"></div>
                          Reserving Name...
                        </div>
                      ) : (
                        <>
                          <BadgeCheck className="w-5 h-5 mr-2" />
                          Reserve My Identity
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: NFT Minting */}
            {step === 2 && (
              <motion.div
                key="nft"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/5">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-cyan-500" />
                  <CardHeader className="pt-8 px-8">
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        <Gift className="w-6 h-6" />
                      </div>
                      Mint Your Pioneer NFT
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-10 space-y-8">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                      <div className="relative p-1 bg-gradient-to-br from-purple-500 via-cyan-500 to-blue-500 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                            <Crown className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">eth.ed Pioneer</h3>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">GENESIS EDITION</Badge>
                          <p className="mt-4 text-slate-400 text-sm px-10">
                            {ensName}.ethed.eth • Pioneer Scholar #001
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                        <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Bonus Multiplier</p>
                        <p className="text-white font-bold">1.5x XP</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                        <Star className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Achievement</p>
                        <p className="text-white font-bold">Founder</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                        <BadgeCheck className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Rarity</p>
                        <p className="text-white font-bold">Epic</p>
                      </div>
                    </div>

                    <Button
                      onClick={mintGenesisNFTs}
                      size="lg"
                      className="w-full h-14 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Minting Collection...
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Claim My Pioneer NFT
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-slate-500 italic">
                      This is a gasless transaction. Built on Base.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Completion */}
            {step === 3 && (
              <motion.div
                key="complete"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="bg-slate-900/50 backdrop-blur-xl border border-white/5 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
                  <CardContent className="text-center pt-12 pb-10 px-8 space-y-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full" />
                      <div className="text-7xl relative mb-4">🎊</div>
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">
                        You're All Set!
                      </h2>
                      <p className="text-cyan-400 font-mono text-lg">
                        {ensName}.ethed.eth
                      </p>
                    </div>
                    
                    <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                      Welcome to the future of learning. Your identity is registered, 
                      your pioneer badge is minted, and the cosmos of knowledge awaits.
                    </p>

                    <div className="flex justify-center gap-4">
                      {nftsMinted.map((nft, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                           <div className="w-16 h-16 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center text-2xl">
                             {nft === 'ens-pioneer' ? '🌐' : '🏆'}
                           </div>
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{nft.replace('-', ' ')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={completeOnboarding}
                        size="lg"
                        className="w-full h-14 bg-white hover:bg-slate-200 text-slate-950 font-bold text-lg"
                      >
                        <Sparkles className="w-5 h-5 mr-2 text-cyan-500" />
                        Enter the Learning Hub
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
