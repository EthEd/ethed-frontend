'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Search, Ban, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
  xp: number;
  level: number;
}

interface PaginatedResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
  MODERATOR: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  USER: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export default function ModeratorUsersPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    type: 'ban' | 'unban';
    userName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('q', search);
    const res = await fetch(`/api/moderator/users?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function applyAction() {
    if (!confirmAction) return;
    setError(null);
    const res = await fetch('/api/moderator/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: confirmAction.userId,
        banned: confirmAction.type === 'ban',
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Action failed');
    }
    setConfirmAction(null);
    fetchUsers();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Users</h1>
        </div>
        <p className="text-slate-400 text-sm">You can ban or unban regular users. Role changes require admin access.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="pl-9 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                    <th className="text-left px-4 py-3">User</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">XP / Level</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Joined</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image src={user.image} alt={user.name ?? ''} width={32} height={32} className="rounded-full border border-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                              {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{user.name ?? '—'}</p>
                            <p className="text-slate-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs ${ROLE_COLORS[user.role] ?? ''}`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {user.xp} XP · Lv {user.level}
                      </td>
                      <td className="px-4 py-3">
                        {user.banned ? (
                          <Badge variant="outline" className="text-red-400 border-red-500/30 bg-red-500/10 text-xs">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* Moderators cannot act on elevated roles */}
                        {user.role === 'ADMIN' || user.role === 'MODERATOR' ? (
                          <span className="text-slate-600 text-xs">—</span>
                        ) : user.banned ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => setConfirmAction({ userId: user.id, type: 'unban', userName: user.name ?? user.email ?? user.id })}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />Unban
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => setConfirmAction({ userId: user.id, type: 'ban', userName: user.name ?? user.email ?? user.id })}
                          >
                            <Ban className="h-3 w-3 mr-1" />Ban
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <span>{data.total} users</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-white/10 text-slate-300 bg-white/5">
              Previous
            </Button>
            <span className="px-3 py-1.5 text-slate-300">Page {page} / {data.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="border-white/10 text-slate-300 bg-white/5">
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={open => !open && setConfirmAction(null)}>
        <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'ban' ? 'Ban user' : 'Unban user'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmAction?.type === 'ban'
                ? `${confirmAction.userName} will be banned and unable to sign in.`
                : `${confirmAction?.userName} will be able to sign in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={applyAction}
              className={confirmAction?.type === 'ban' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
