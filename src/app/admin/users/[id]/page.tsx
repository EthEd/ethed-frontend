'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Gem,
  Loader2,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
  startedAt: string;
  finishedAt: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
}

interface NFT {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  contractAddress: string | null;
  chainId: number | null;
  mintedAt: string | null;
  createdAt: string;
}

interface Wallet {
  id: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  ensName: string | null;
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
  courses: Enrollment[];
  nfts: NFT[];
  wallets: Wallet[];
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
  MODERATOR: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  USER: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export default function AdminUserDetailPage() {
  const { id: userId } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user || (user as any).error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        User not found.
      </div>
    );
  }

  const completedCourses = user.courses.filter(e => e.completed).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back */}
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
          >
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>

        {/* Profile header */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? ''}
                  width={72}
                  height={72}
                  className="rounded-full border-2 border-white/10 shrink-0"
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-slate-700 flex items-center justify-center text-2xl text-slate-300 border-2 border-white/10 w-[72px] h-[72px] shrink-0">
                  {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold text-white">{user.name ?? '—'}</h1>
                  <Badge variant="outline" className={ROLE_COLORS[user.role] ?? ''}>
                    {user.role}
                  </Badge>
                  {user.banned && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                      BANNED
                    </Badge>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-3">{user.email}</p>
                {user.banned && user.banReason && (
                  <p className="text-red-400/80 text-xs bg-red-500/10 border border-red-500/20 rounded px-3 py-2 mb-3">
                    <strong>Ban reason:</strong> {user.banReason}
                    {user.banExpires && ` · Expires ${new Date(user.banExpires).toLocaleDateString()}`}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                    {user.xp.toLocaleString()} XP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-cyan-400" />
                    Level {user.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    {user.streak} day streak
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-900/40 border border-white/10">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{user.courses.length}</p>
              <p className="text-xs text-slate-400">Enrolled</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{completedCourses}</p>
              <p className="text-xs text-slate-400">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border border-white/10">
            <CardContent className="p-4 text-center">
              <Gem className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{user.nfts.length}</p>
              <p className="text-xs text-slate-400">NFTs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border border-white/10">
            <CardContent className="p-4 text-center">
              <Wallet className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{user.wallets.length}</p>
              <p className="text-xs text-slate-400">Wallets</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollments */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-blue-400" />
                Course Enrollments
              </CardTitle>
              <CardDescription>
                {completedCourses} of {user.courses.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {user.courses.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No enrollments yet.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {user.courses.map(enrollment => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate">
                          {enrollment.course.title}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Started {new Date(enrollment.startedAt).toLocaleDateString()}
                          {enrollment.finishedAt && ` · Finished ${new Date(enrollment.finishedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-slate-400 text-xs">{enrollment.progress}%</span>
                        {enrollment.completed ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* NFTs */}
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Gem className="h-4 w-4 text-indigo-400" />
                  NFTs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {user.nfts.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No NFTs minted yet.</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {user.nfts.map(nft => (
                      <div key={nft.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                        {nft.image ? (
                          <Image
                            src={nft.image}
                            alt={nft.name}
                            width={40}
                            height={40}
                            className="rounded-lg border border-white/10 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                            <Award className="h-5 w-5 text-indigo-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{nft.name}</p>
                          <p className="text-slate-500 text-xs">
                            Token #{nft.tokenId}
                            {nft.chainId && ` · Chain ${nft.chainId}`}
                          </p>
                        </div>
                        {nft.mintedAt && (
                          <p className="text-slate-500 text-xs shrink-0">
                            {new Date(nft.mintedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallets */}
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  Connected Wallets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {user.wallets.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No wallets connected.</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {user.wallets.map(wallet => (
                      <div key={wallet.id} className="px-4 py-3 hover:bg-white/3 transition-colors">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white text-sm font-mono truncate">
                            {wallet.address.slice(0, 10)}…{wallet.address.slice(-8)}
                          </p>
                          {wallet.isPrimary && (
                            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        {wallet.ensName && (
                          <p className="text-cyan-400/70 text-xs">{wallet.ensName}</p>
                        )}
                        <p className="text-slate-600 text-xs">Chain {wallet.chainId}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
          >
            <Link href={`/admin/users?q=${encodeURIComponent(user.email ?? '')}`}>
              Back to Users
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-orange-500/30 text-orange-400 bg-white/5 hover:bg-orange-500/10"
          >
            <Link href={`/admin/audit-logs`}>
              View Audit Logs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
