'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus, Search, Users, Target, ArrowRight, Sparkles, Loader2,
  FolderOpen, TrendingUp, Calendar, User, DollarSign, Layers,
  Filter, Heart,
} from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  type: 'INDIVIDUAL' | 'GROUP';
  status: 'OPEN' | 'IN_PROGRESS' | 'FUNDED' | 'COMPLETED' | 'ARCHIVED';
  fundingGoal: number | null;
  fundingRaised: number;
  maxMembers: number | null;
  tags: string[];
  imageUrl: string | null;
  createdAt: string;
  creator: { id: string; name: string | null; image: string | null };
  members: Array<{ user: { id: string; name: string | null; image: string | null }; role: string }>;
  _count: { members: number; donations: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  FUNDED: { label: 'Funded', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  COMPLETED: { label: 'Completed', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  ARCHIVED: { label: 'Archived', color: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20' },
};

const TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'Solo',
  GROUP: 'Team',
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'GROUP',
    category: 'general',
    fundingGoal: '',
    maxMembers: '',
    tags: '',
  });

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      params.set('limit', '50');

      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, search]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          fundingGoal: form.fundingGoal || undefined,
          maxMembers: form.maxMembers || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Project created!');
        setCreateOpen(false);
        setForm({ title: '', description: '', type: 'INDIVIDUAL', category: 'general', fundingGoal: '', maxMembers: '', tags: '' });
        fetchProjects();
      } else {
        toast.error(data.error || 'Failed to create project');
      }
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (projectId: string) => {
    if (!session) {
      toast.error('Sign in to join a project');
      return;
    }
    setJoining(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/join`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Joined project!');
        fetchProjects();
      } else {
        toast.error(data.error || 'Failed to join');
      }
    } catch {
      toast.error('Failed to join project');
    } finally {
      setJoining(null);
    }
  };

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
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-500" />
              </div>
              <Badge variant="outline" className="border-purple-500/30 text-purple-500">
                Community
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Projects
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Browse, join, and fund community-driven blockchain projects. 
              Collaborate with other learners or start your own.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border/50 bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="FUNDED">Funded</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INDIVIDUAL">Solo</SelectItem>
                <SelectItem value="GROUP">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {session && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create a Project</DialogTitle>
                  <DialogDescription>Start a solo or team project for the community.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="My Web3 Project" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe your project..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as 'INDIVIDUAL' | 'GROUP' }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Solo Project</SelectItem>
                          <SelectItem value="GROUP">Team Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="defi">DeFi</SelectItem>
                          <SelectItem value="nft">NFT</SelectItem>
                          <SelectItem value="dao">DAO</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="funding">Funding Goal (MATIC)</Label>
                      <Input id="funding" type="number" step="0.01" value={form.fundingGoal} onChange={(e) => setForm((f) => ({ ...f, fundingGoal: e.target.value }))} placeholder="0.00" />
                    </div>
                    {form.type === 'GROUP' && (
                      <div className="space-y-2">
                        <Label htmlFor="members">Max Members</Label>
                        <Input id="members" type="number" value={form.maxMembers} onChange={(e) => setForm((f) => ({ ...f, maxMembers: e.target.value }))} placeholder="10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="solidity, defi, learning" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={creating} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <FolderOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No projects found</h2>
            <p className="text-muted-foreground mb-6">
              {search ? 'Try adjusting your search terms.' : 'Be the first to create a community project!'}
            </p>
            {session && !search && (
              <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => {
                const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.OPEN;
                const fundingPercent = project.fundingGoal
                  ? Math.min(100, (project.fundingRaised / project.fundingGoal) * 100)
                  : 0;
                const isMember = session?.user?.id && project.members.some((m) => m.user.id === session.user!.id);
                const canJoin = project.type === 'GROUP' && project.status === 'OPEN' && !isMember && session;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-card border-border/50 hover:border-primary/30 transition-all h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {TYPE_LABELS[project.type] || project.type}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {project.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2 line-clamp-1">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-4">
                        {/* Funding Progress */}
                        {project.fundingGoal && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> Raised
                              </span>
                              <span className="font-medium text-foreground">
                                {project.fundingRaised.toFixed(2)} / {project.fundingGoal.toFixed(2)} MATIC
                              </span>
                            </div>
                            <Progress value={fundingPercent} className="h-2" />
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {project._count.members} {project.type === 'GROUP' ? `/ ${project.maxMembers || '∞'}` : ''} member{project._count.members !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {project._count.donations} donation{project._count.donations !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Tags */}
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 4 && (
                              <span className="text-xs text-muted-foreground">+{project.tags.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Creator */}
                        <div className="flex items-center gap-2 pt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={project.creator.image || undefined} />
                            <AvatarFallback className="text-[10px]">
                              {project.creator.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            by {project.creator.name || 'Anonymous'}
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 gap-2">
                        {canJoin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoin(project.id)}
                            disabled={joining === project.id}
                            className="flex-1"
                          >
                            {joining === project.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Users className="h-3 w-3 mr-1" />
                            )}
                            Join
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/donate?project=${project.id}`}>
                            <Heart className="h-3 w-3 mr-1" /> Fund
                          </Link>
                        </Button>
                        {isMember && (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 text-[10px]">
                            Member
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
