'use client';

import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Heart, ArrowRight, Loader2, CheckCircle2, ExternalLink,
  Sparkles, DollarSign, Users, TrendingUp, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DonationRecord {
  id: string;
  amount: number;
  message: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  project: { id: string; title: string; slug: string } | null;
}

interface ProjectBrief {
  id: string;
  title: string;
  description: string;
  fundingGoal: number | null;
  fundingRaised: number;
  creator: { name: string | null };
}

function DonateContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  const [project, setProject] = useState<ProjectBrief | null>(null);
  const [recentDonations, setRecentDonations] = useState<DonationRecord[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch project if specified
        if (projectId) {
          const pRes = await fetch(`/api/projects/${projectId}`);
          const pData = await pRes.json();
          if (pData.success) setProject(pData.project);
        }
        // Fetch recent donations
        const dRes = await fetch('/api/donate?limit=10');
        const dData = await dRes.json();
        if (dData.success) {
          setRecentDonations(dData.donations);
          setTotalRaised(dData.totalRaised);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [projectId]);

  const handleDonate = async () => {
    if (!session) {
      toast.error('Sign in to donate');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      // In a real implementation, this would:
      // 1. Send a transaction on-chain via wagmi/viem
      // 2. Wait for confirmation
      // 3. Submit the txHash to the API
      // For now we simulate with a mock txHash
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId || undefined,
          amount,
          txHash: mockTxHash,
          chainId: 80002, // Polygon Amoy
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        toast.success('Donation recorded!');
        // Refresh donations
        const dRes = await fetch('/api/donate?limit=10');
        const dData = await dRes.json();
        if (dData.success) {
          setRecentDonations(dData.donations);
          setTotalRaised(dData.totalRaised);
        }
      } else {
        toast.error(data.error || 'Donation failed');
      }
    } catch {
      toast.error('Donation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const presetAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-emerald-500" />
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                Support
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Donate
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Support community projects and help fund blockchain education. 
              Every contribution makes a difference.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Donation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Context */}
            {project && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Funding: {project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        {project.fundingGoal && (
                          <p className="text-sm mt-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            {project.fundingRaised.toFixed(2)} / {project.fundingGoal.toFixed(2)} MATIC raised
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                    <p className="text-muted-foreground mb-6">Your donation has been recorded.</p>
                    <Button onClick={() => { setSuccess(false); setAmount(''); setMessage(''); }} variant="outline">
                      Donate Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      Make a Donation
                    </CardTitle>
                    <CardDescription>
                      {session ? 'Choose an amount and send your donation on Polygon Amoy.' : 'Sign in to make a donation.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!session ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">Please sign in to make a donation.</p>
                      </div>
                    ) : (
                      <>
                        {/* Preset Amounts */}
                        <div className="space-y-2">
                          <Label>Quick Amount (MATIC)</Label>
                          <div className="flex flex-wrap gap-2">
                            {presetAmounts.map((preset) => (
                              <Button
                                key={preset}
                                variant={amount === preset ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setAmount(preset)}
                                className={amount === preset ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                              >
                                {preset} MATIC
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Amount */}
                        <div className="space-y-2">
                          <Label htmlFor="amount">Custom Amount (MATIC)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.001"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                          <Label htmlFor="msg">Message (optional)</Label>
                          <Textarea
                            id="msg"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Leave a message with your donation..."
                            rows={2}
                          />
                        </div>

                        <Separator />

                        <Button
                          onClick={handleDonate}
                          disabled={submitting || !amount || parseFloat(amount) <= 0}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          size="lg"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Heart className="h-4 w-4 mr-2" />
                          )}
                          Donate {amount ? `${amount} MATIC` : ''}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          Transactions are processed on the Polygon Amoy testnet (Chain ID: 80002).
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Total Raised</span>
                  <span className="font-bold text-foreground">{totalRaised.toFixed(2)} MATIC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Donations</span>
                  <span className="font-bold text-foreground">{recentDonations.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentDonations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No donations yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentDonations.map((d) => (
                      <div key={d.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={d.user.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {d.user.name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {d.user.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {d.project ? `→ ${d.project.title}` : 'General donation'}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-500 shrink-0">
                          {d.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DonateContent />
    </Suspense>
  );
}
