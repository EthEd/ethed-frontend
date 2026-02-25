'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Search, X } from 'lucide-react';
import Image from 'next/image';

interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface PaginatedResponse {
  logs: AuditEntry[];
  total: number;
  page: number;
  totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
  USER_ROLE_CHANGED: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  USER_BANNED: 'bg-red-500/20 text-red-300 border-red-500/30',
  USER_UNBANNED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  COURSE_CREATED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  COURSE_UPDATED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  COURSE_DELETED: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const ALL_ACTIONS = [
  'USER_ROLE_CHANGED',
  'USER_BANNED',
  'USER_UNBANNED',
  'COURSE_CREATED',
  'COURSE_UPDATED',
  'COURSE_DELETED',
];

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [actorSearch, setActorSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (actionFilter) params.set('action', actionFilter);
    if (actorSearch) params.set('actor', actorSearch);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    const res = await fetch(`/api/admin/audit-logs?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, actionFilter, actorSearch, fromDate, toDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function clearFilters() {
    setActionFilter('');
    setActorSearch('');
    setFromDate('');
    setToDate('');
    setPage(1);
  }

  const hasFilters = actionFilter || actorSearch || fromDate || toDate;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="h-5 w-5 text-orange-400" />
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        </div>
        <p className="text-slate-400 text-sm">All admin and moderator actions are recorded here.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={actionFilter} onValueChange={v => { setActionFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-56 bg-slate-900/60 border-white/10 text-white">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10 text-white">
            <SelectItem value="ALL">All actions</SelectItem>
            {ALL_ACTIONS.map(a => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={actorSearch}
            onChange={e => { setActorSearch(e.target.value); setPage(1); }}
            placeholder="Search by actor name/email…"
            className="pl-9 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500 w-56"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs shrink-0">From</label>
          <Input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setPage(1); }}
            className="bg-slate-900/60 border-white/10 text-white w-36 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 text-xs shrink-0">To</label>
          <Input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setPage(1); }}
            className="bg-slate-900/60 border-white/10 text-white w-36 text-sm"
          />
        </div>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-white/10 text-slate-400 bg-white/5 hover:bg-white/10 h-10"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
            </div>
          ) : data?.logs.length === 0 ? (
            <div className="text-center py-16 text-slate-500">No audit log entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs uppercase">
                    <th className="text-left px-4 py-3">Actor</th>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3">Target</th>
                    <th className="text-left px-4 py-3">Details</th>
                    <th className="text-left px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.logs.map(log => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {log.actor.image ? (
                            <Image src={log.actor.image} alt={log.actor.name ?? ''} width={28} height={28} className="rounded-full border border-white/10" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                              {(log.actor.name ?? log.actor.email ?? '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white text-xs font-medium">{log.actor.name ?? '—'}</p>
                            <p className="text-slate-500 text-xs">{log.actor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${ACTION_COLORS[log.action] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {log.targetType && log.targetId ? (
                          <span>{log.targetType} · <code className="text-slate-500">{log.targetId.slice(0, 8)}…</code></span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
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
          <span>{data.total} entries</span>
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
    </div>
  );
}
