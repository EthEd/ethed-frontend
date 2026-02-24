'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User, Wallet, Bell, Shield, Trash2, Save, Loader2,
  Copy, Check, Star, ExternalLink, LogOut, AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface WalletAddress {
  id: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  ensName: string | null;
  ensAvatar: string | null;
  createdAt: string;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  80002: 'Polygon Amoy',
  11155111: 'Sepolia',
};

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Profile state
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Wallets state
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notification prefs
  const [notifyCourseCompletion, setNotifyCourseCompletion] = useState(true);
  const [notifyNewCourses, setNotifyNewCourses] = useState(false);
  const [notifyNFT, setNotifyNFT] = useState(true);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const notifDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Danger zone
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Seed form from session once loaded
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setImageUrl(session.user.image ?? '');
    }
  }, [session]);

  // Load notification prefs from API
  useEffect(() => {
    fetch('/api/user/notifications')
      .then(r => r.json())
      .then(data => {
        if (data.prefs) {
          setNotifyCourseCompletion(data.prefs.courseCompletion);
          setNotifyNewCourses(data.prefs.newCourses);
          setNotifyNFT(data.prefs.nftMinting);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch connected wallets
  useEffect(() => {
    setWalletsLoading(true);
    fetch('/api/user/wallets')
      .then(r => r.json())
      .then(data => {
        setWallets(data.wallets ?? []);
      })
      .catch(() => toast.error('Failed to load wallets'))
      .finally(() => setWalletsLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image: imageUrl.trim() || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to save');
      await update({ name: name.trim(), image: imageUrl.trim() || undefined });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCopyAddress(wallet: WalletAddress) {
    await navigator.clipboard.writeText(wallet.address);
    setCopiedId(wallet.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function saveNotifPrefs(prefs: { courseCompletion: boolean; newCourses: boolean; nftMinting: boolean }) {
    if (notifDebounce.current) clearTimeout(notifDebounce.current);
    setSavingNotifs(true);
    notifDebounce.current = setTimeout(async () => {
      try {
        await fetch('/api/user/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        });
        toast.success('Notification preferences saved');
      } catch {
        toast.error('Failed to save preferences');
      } finally {
        setSavingNotifs(false);
      }
    }, 600);
  }

  function handleNotifToggle(key: 'courseCompletion' | 'newCourses' | 'nftMinting', value: boolean) {
    const next = {
      courseCompletion: notifyCourseCompletion,
      newCourses: notifyNewCourses,
      nftMinting: notifyNFT,
      [key]: value,
    };
    if (key === 'courseCompletion') setNotifyCourseCompletion(value);
    if (key === 'newCourses') setNotifyNewCourses(value);
    if (key === 'nftMinting') setNotifyNFT(value);
    saveNotifPrefs(next);
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Delete failed');
      toast.success('Account deleted');
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete account');
      setDeletingAccount(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Manage your profile, wallets, and account preferences.</p>
        </motion.div>

        {/* ── Profile ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-white text-lg">Profile</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Update your public display name and avatar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex items-center gap-5">
                  <Avatar className="h-16 w-16 ring-2 ring-white/10">
                    <AvatarImage src={imageUrl || session.user.image || ''} />
                    <AvatarFallback className="bg-slate-700 text-white text-lg">
                      {(name || session.user.name || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <Label className="text-slate-300 text-sm">Avatar URL</Label>
                    <Input
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Display name</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Email</Label>
                  <Input
                    value={session.user.email ?? '—'}
                    disabled
                    className="bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Email cannot be changed from here.</p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[110px]"
                  >
                    {savingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Connected Wallets ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white text-lg">Connected Wallets</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Wallets linked to your account for on-chain activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              ) : wallets.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No wallets connected yet.</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Connect a wallet from the navbar to get started.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {wallets.map(w => (
                    <li
                      key={w.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-white">
                              {w.ensName ?? truncateAddress(w.address)}
                            </span>
                            {w.isPrimary && (
                              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                                <Star className="h-2.5 w-2.5 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 font-mono">
                              {truncateAddress(w.address)}
                            </span>
                            <span className="text-xs text-slate-600">·</span>
                            <span className="text-xs text-slate-500">
                              {CHAIN_NAMES[w.chainId] ?? `Chain ${w.chainId}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"
                          onClick={() => handleCopyAddress(w)}
                          title="Copy address"
                        >
                          {copiedId === w.id ? (
                            <Check className="h-3.5 w-3.5 text-cyan-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <a
                          href={`https://polygonscan.com/address/${w.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="View on explorer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Notification Preferences ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-400" />
                  <CardTitle className="text-white text-lg">Notifications</CardTitle>
                </div>
                {savingNotifs && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
              </div>
              <CardDescription className="text-slate-400">
                Choose what emails you&apos;d like to receive. Changes save automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Course completion</p>
                  <p className="text-xs text-slate-500">Email when you finish a course and earn an NFT.</p>
                </div>
                <Switch
                  checked={notifyCourseCompletion}
                  onCheckedChange={v => handleNotifToggle('courseCompletion', v)}
                  className="data-[state=checked]:bg-cyan-600"
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">New courses</p>
                  <p className="text-xs text-slate-500">Notify me when new courses are published.</p>
                </div>
                <Switch
                  checked={notifyNewCourses}
                  onCheckedChange={v => handleNotifToggle('newCourses', v)}
                  className="data-[state=checked]:bg-cyan-600"
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">NFT minting</p>
                  <p className="text-xs text-slate-500">Get notified when your achievement NFT is minted on-chain.</p>
                </div>
                <Switch
                  checked={notifyNFT}
                  onCheckedChange={v => handleNotifToggle('nftMinting', v)}
                  className="data-[state=checked]:bg-cyan-600"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Account ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-400" />
                <CardTitle className="text-white text-lg">Account</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Session and account management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm text-white font-medium">Sign out</p>
                  <p className="text-xs text-slate-500">End your current session on this device.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-slate-900/40 border border-red-500/20 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <CardTitle className="text-red-400 text-lg">Danger Zone</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                <div>
                  <p className="text-sm text-white font-medium">Delete account</p>
                  <p className="text-xs text-slate-500">
                    Permanently remove your account, profile, and all data. This cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white ml-4 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        Delete your account?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This will permanently delete your account, all earned XP, NFT records, course
                        progress, and wallet connections. This action <strong className="text-white">cannot be undone</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deletingAccount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Yes, delete my account'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
