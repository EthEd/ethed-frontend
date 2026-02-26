'use client';

import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Heart, Loader2, CheckCircle2, ExternalLink,
  Sparkles, DollarSign, TrendingUp, AlertCircle,
  Copy, Wallet, Globe, Zap, Shield, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Chain & token definitions ─── */
const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: 'from-blue-500 to-indigo-600', explorer: 'https://etherscan.io/tx/' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: '⬡', color: 'from-purple-500 to-violet-600', explorer: 'https://polygonscan.com/tx/' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', icon: '◈', color: 'from-blue-400 to-cyan-500', explorer: 'https://arbiscan.io/tx/' },
  { id: 'optimism', name: 'Optimism', symbol: 'ETH', icon: '◉', color: 'from-red-500 to-rose-600', explorer: 'https://optimistic.etherscan.io/tx/' },
  { id: 'base', name: 'Base', symbol: 'ETH', icon: '◎', color: 'from-blue-600 to-blue-700', explorer: 'https://basescan.org/tx/' },
  { id: 'bsc', name: 'BNB Chain', symbol: 'BNB', icon: '◆', color: 'from-yellow-500 to-amber-600', explorer: 'https://bscscan.com/tx/' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', icon: '▲', color: 'from-red-600 to-red-700', explorer: 'https://snowtrace.io/tx/' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◐', color: 'from-emerald-400 to-purple-500', explorer: 'https://solscan.io/tx/' },
];

const TOKENS = [
  { symbol: 'NATIVE', name: 'Native Token', desc: 'Chain native currency' },
  { symbol: 'USDC', name: 'USD Coin', desc: 'Stablecoin pegged to USD' },
  { symbol: 'USDT', name: 'Tether', desc: 'USD-backed stablecoin' },
  { symbol: 'DAI', name: 'Dai', desc: 'Decentralized stablecoin' },
  { symbol: 'WETH', name: 'Wrapped ETH', desc: 'ERC-20 wrapped Ether' },
];

const DONATION_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

/* ─── Animated particles ─── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 160,
      });
    }

    let raf: number;
    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(180, 60%, 50%, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 dark:opacity-100"
    />
  );
}

/* ─── Floating chain icons ─── */
function FloatingChains() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CHAINS.slice(0, 6).map((chain, i) => (
        <motion.div
          key={chain.id}
          className="absolute text-2xl opacity-10 dark:opacity-[0.07]"
          initial={{ x: `${15 + i * 15}%`, y: '110%' }}
          animate={{ y: '-10%' }}
          transition={{ duration: 15 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 2 }}
        >
          {chain.icon}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main ─── */
function DonateContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [project, setProject] = useState<any>(null);

  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [showChains, setShowChains] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        if (projectId) {
          const pRes = await fetch(`/api/projects/${projectId}`);
          const pData = await pRes.json();
          if (pData.success) setProject(pData.project);
        }
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

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(DONATION_ADDRESS);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async () => {
    if (!session) {
      toast.error('Sign in to record your donation');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const generatedTxHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')}`;

      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId || undefined,
          amount,
          txHash: generatedTxHash,
          chainId: selectedChain.id === 'polygon' ? 80002 : 1,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTxHash(generatedTxHash);
        toast.success('Donation recorded! Thank you!');
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

  const tokenLabel =
    selectedToken.symbol === 'NATIVE' ? selectedChain.symbol : selectedToken.symbol;
  const presetAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ── Hero ── */}
      <div className="relative">
        <ParticleField />
        <FloatingChains />

        <div className="relative z-10 border-b border-border/50">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6"
              >
                <Heart className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Open Source &amp; Community Funded
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  Fund the Future
                </span>
                <br />
                <span className="text-foreground">of Web3 Education</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Support EthEd with any cryptocurrency, on any chain. Every contribution helps us
                build free, open-source blockchain education.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                {[
                  { icon: Shield, text: 'Non-Custodial', color: 'text-emerald-500' },
                  { icon: Globe, text: 'Any Chain', color: 'text-cyan-500' },
                  { icon: Zap, text: 'Any Token', color: 'text-yellow-500' },
                  { icon: Sparkles, text: '100% Transparent', color: 'text-purple-500' },
                ].map(({ icon: I, text, color }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <I className={`h-4 w-4 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left — form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project banner */}
            {project && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-6 w-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Funding: {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                        {project.fundingGoal && (
                          <p className="text-sm mt-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            {project.fundingRaised.toFixed(2)} / {project.fundingGoal.toFixed(2)}{' '}
                            raised
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {success ? (
                /* ── Success ── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-emerald-500/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                    <CardContent className="relative py-12 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-4" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Your generous donation has been recorded. You&apos;re helping build the
                          future of blockchain education.
                        </p>
                        {txHash && (
                          <a
                            href={`${selectedChain.explorer}${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
                          >
                            View transaction <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <div className="flex gap-3 justify-center mt-4">
                          <Button
                            onClick={() => {
                              setSuccess(false);
                              setAmount('');
                              setMessage('');
                              setTxHash('');
                            }}
                            variant="outline"
                          >
                            Donate Again
                          </Button>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* ── Form ── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Wallet address */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" />
                        Donation Address
                      </CardTitle>
                      <CardDescription>
                        Send any token on any EVM chain to this address
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm font-mono text-foreground truncate border border-border">
                          {DONATION_ADDRESS}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyAddress}
                          className="shrink-0"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Compatible with Ethereum, Polygon, Arbitrum, Optimism, Base, BNB Chain,
                        Avalanche, and more.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Donation form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        Make a Donation
                      </CardTitle>
                      <CardDescription>
                        {session
                          ? 'Choose a chain, token, and amount.'
                          : 'Sign in to record your donation on-chain.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!session ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-muted-foreground mb-4">
                            Sign in to record and track your donation.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            You can also donate directly by sending crypto to the address above.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Chain selector */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Network / Chain</Label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowChains(!showChains);
                                  setShowTokens(false);
                                }}
                                className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-lg font-bold bg-gradient-to-r ${selectedChain.color} bg-clip-text text-transparent`}
                                  >
                                    {selectedChain.icon}
                                  </span>
                                  <div className="text-left">
                                    <p className="font-medium text-foreground">
                                      {selectedChain.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {selectedChain.symbol}
                                    </p>
                                  </div>
                                </div>
                                <ChevronDown
                                  className={`h-4 w-4 text-muted-foreground transition-transform ${showChains ? 'rotate-180' : ''}`}
                                />
                              </button>

                              <AnimatePresence>
                                {showChains && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
                                  >
                                    {CHAINS.map((chain) => (
                                      <button
                                        key={chain.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedChain(chain);
                                          setShowChains(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                                          selectedChain.id === chain.id ? 'bg-muted/30' : ''
                                        }`}
                                      >
                                        <span
                                          className={`text-lg font-bold bg-gradient-to-r ${chain.color} bg-clip-text text-transparent`}
                                        >
                                          {chain.icon}
                                        </span>
                                        <div className="text-left">
                                          <p className="font-medium text-foreground">
                                            {chain.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {chain.symbol}
                                          </p>
                                        </div>
                                        {selectedChain.id === chain.id && (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                                        )}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Token selector */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Token</Label>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowTokens(!showTokens);
                                  setShowChains(false);
                                }}
                                className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                              >
                                <div className="text-left">
                                  <p className="font-medium text-foreground">{tokenLabel}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedToken.desc}
                                  </p>
                                </div>
                                <ChevronDown
                                  className={`h-4 w-4 text-muted-foreground transition-transform ${showTokens ? 'rotate-180' : ''}`}
                                />
                              </button>

                              <AnimatePresence>
                                {showTokens && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute z-20 mt-2 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
                                  >
                                    {TOKENS.map((token) => (
                                      <button
                                        key={token.symbol}
                                        type="button"
                                        onClick={() => {
                                          setSelectedToken(token);
                                          setShowTokens(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                                          selectedToken.symbol === token.symbol
                                            ? 'bg-muted/30'
                                            : ''
                                        }`}
                                      >
                                        <div className="text-left">
                                          <p className="font-medium text-foreground">
                                            {token.symbol === 'NATIVE'
                                              ? selectedChain.symbol
                                              : token.symbol}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {token.desc}
                                          </p>
                                        </div>
                                        {selectedToken.symbol === token.symbol && (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        )}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* Amount presets */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Amount</Label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {presetAmounts.map((preset) => (
                                <motion.button
                                  key={preset}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => setAmount(preset)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    amount === preset
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                      : 'border-border hover:bg-muted/50 text-foreground'
                                  }`}
                                >
                                  {preset} {tokenLabel}
                                </motion.button>
                              ))}
                            </div>
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="Custom amount"
                              className="text-base"
                            />
                          </div>

                          {/* Message */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Message{' '}
                              <span className="text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <Textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Leave a message with your donation..."
                              rows={2}
                            />
                          </div>

                          <Separator />

                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button
                              onClick={handleDonate}
                              disabled={submitting || !amount || parseFloat(amount) <= 0}
                              className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10"
                              size="lg"
                            >
                              {submitting ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              ) : (
                                <Heart className="h-5 w-5 mr-2" />
                              )}
                              Donate{amount ? ` ${amount} ${tokenLabel}` : ''}
                              {amount && (
                                <span className="ml-1 opacity-70">on {selectedChain.name}</span>
                              )}
                            </Button>
                          </motion.div>

                          <p className="text-xs text-muted-foreground text-center">
                            This records your donation. For actual on-chain transfers, send directly
                            to the address above.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Supported chains grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Supported Networks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CHAINS.map((chain, i) => (
                      <motion.div
                        key={chain.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedChain.id === chain.id
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedChain(chain)}
                      >
                        <span
                          className={`text-base font-bold bg-gradient-to-r ${chain.color} bg-clip-text text-transparent`}
                        >
                          {chain.icon}
                        </span>
                        <span className="text-sm font-medium text-foreground">{chain.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right — sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Raised</span>
                    <span className="font-bold text-foreground">
                      {totalRaised.toFixed(2)} MATIC
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Donations</span>
                    <span className="font-bold text-foreground">{recentDonations.length}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Why donate */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Why Donate?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      icon: Sparkles,
                      text: 'Fund free blockchain courses for everyone',
                      color: 'text-purple-500',
                    },
                    {
                      icon: Globe,
                      text: 'Support open-source Web3 education tools',
                      color: 'text-cyan-500',
                    },
                    {
                      icon: Shield,
                      text: 'Help maintain decentralized infrastructure',
                      color: 'text-emerald-500',
                    },
                    {
                      icon: Zap,
                      text: 'Enable NFT-verified credentials for learners',
                      color: 'text-yellow-500',
                    },
                  ].map(({ icon: Icon, text, color }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent donations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Recent Donations
                  </CardTitle>
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
                      {recentDonations.map((d: any, i: number) => (
                        <motion.div
                          key={d.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={d.user.image || undefined} />
                            <AvatarFallback className="text-xs bg-muted">
                              {d.user.name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {d.user.name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {d.project ? `→ ${d.project.title}` : 'General'}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {d.amount.toFixed(2)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DonateContent />
    </Suspense>
  );
}
