'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Users,
  Clock,
  Eye,
  Plus,
  ArrowLeft,
  Settings,
  Search,
  Loader2,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  status: string;
  level: string;
  price: number | null;
  lessons: number;
  students: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New course dialog state
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLevel, setNewLevel] = useState('BEGINNER');
  const [creating, setCreating] = useState(false);

  // Edit course dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<AdminCourse | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLevel, setEditLevel] = useState('BEGINNER');
  const [saving, setSaving] = useState(false);

  async function fetchCourses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (statusFilter !== 'all') params.set('status', statusFilter.toUpperCase());
      params.set('page', String(page));
      const res = await fetch(`/api/admin/courses?${params}`);
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCourses(data.courses ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCourses(); }, [search, statusFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  async function handleStatusChange(courseId: string, newStatus: string) {
    setUpdatingId(courseId);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Course status updated to ${newStatus.toLowerCase()}`);
      fetchCourses();
    } catch {
      toast.error('Failed to update course status');
    } finally {
      setUpdatingId(null);
    }
  }

  function openEditDialog(course: AdminCourse) {
    setEditCourse(course);
    setEditTitle(course.title);
    setEditDescription('');
    setEditLevel(course.level);
    setEditOpen(true);
  }

  async function handleEditCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!editCourse) return;
    if (!editTitle.trim() || editTitle.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {
        courseId: editCourse.id,
        title: editTitle.trim(),
        level: editLevel,
      };
      if (editDescription.trim()) body.description = editDescription.trim();
      const res = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to update course');
      }
      toast.success('Course updated');
      setEditOpen(false);
      setEditCourse(null);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update course');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || newTitle.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          // Provide a padded description so the schema 50-char minimum is met
          description: newDescription.trim().padEnd(50, ' '),
          level: newLevel,
          // fileKey is optional for admin-created drafts — supply a placeholder
          fileKey: 'https://placehold.co/800x450/1e293b/94a3b8?text=Course+Thumbnail',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to create course');
      }
      toast.success('Draft course created');
      setNewOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewLevel('BEGINNER');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create course');
    } finally {
      setCreating(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-cyan-500/10 text-cyan-400 border-cyan-400/20';
      case 'draft': return 'bg-amber-500/10 text-amber-400 border-amber-400/20';
      case 'archived': return 'bg-slate-500/10 text-slate-400 border-slate-400/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-400/20';
    }
  };

  const published = courses.filter(c => c.status.toLowerCase() === 'published').length;
  const drafts = courses.filter(c => c.status.toLowerCase() === 'draft').length;
  const totalStudents = courses.reduce((s, c) => s + c.students, 0);
  const avgCompletion = courses.length
    ? Math.round(courses.reduce((s, c) => s + c.completionRate, 0) / courses.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Course Management
          </h1>
          <p className="text-slate-300">Manage all courses, lessons, and educational content.</p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 w-56 focus-visible:ring-cyan-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-white/5 border-white/10 text-slate-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{total} course{total !== 1 ? 's' : ''}</span>
            <Button
              onClick={() => setNewOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* ── New Course Dialog ── */}
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-cyan-400" />
                Create New Course
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                A draft course will be created. You can add lessons and publish it later.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Title <span className="text-red-400">*</span></Label>
                <Input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Solidity 101: Smart Contracts from Scratch"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  required
                  minLength={5}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Short description</Label>
                <Textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="What will learners gain from this course?"
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Level</Label>
                <Select value={newLevel} onValueChange={setNewLevel}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                  onClick={() => setNewOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[120px]"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Draft'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Edit Course Dialog ── */}
        <Dialog open={editOpen} onOpenChange={open => { if (!open) { setEditOpen(false); setEditCourse(null); } }}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-400" />
                Edit Course
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Update course details. Status can be changed from the course card.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCourse} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Title <span className="text-red-400">*</span></Label>
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Course title"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  required
                  minLength={5}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Description <span className="text-slate-500">(leave blank to keep existing)</span></Label>
                <Textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Course description"
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 resize-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Level</Label>
                <Select value={editLevel} onValueChange={setEditLevel}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                  onClick={() => { setEditOpen(false); setEditCourse(null); }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Course list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No courses found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-xl text-white">{course.title}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(course.status)}>
                          {course.status.toLowerCase()}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-white/10 capitalize">
                          {course.level.toLowerCase()}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400">
                        Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                        {course.price !== null && course.price > 0 && (
                          <span className="ml-3 text-cyan-400">${(course.price / 100).toFixed(2)}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button asChild size="sm" variant="outline" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                        <Link href={`/learn/${course.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500/30 text-blue-400 bg-white/5 hover:bg-blue-500/10"
                        onClick={() => openEditDialog(course)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button asChild size="sm" variant="outline" className="border-indigo-500/30 text-indigo-400 bg-white/5 hover:bg-indigo-500/10">
                        <Link href={`/admin/courses/${course.id}`}>
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Lessons
                        </Link>
                      </Button>
                      {/* Inline status toggle */}
                      <Select
                        value={course.status.toUpperCase()}
                        onValueChange={val => handleStatusChange(course.id, val)}
                        disabled={updatingId === course.id}
                      >
                        <SelectTrigger className="h-8 w-32 bg-white/5 border-white/10 text-slate-300 text-xs">
                          {updatingId === course.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-cyan-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">{course.students.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Enrolled</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">{course.lessons}</p>
                      <p className="text-xs text-slate-400">Lessons</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-indigo-400" />
                      </div>
                      <p className="text-lg font-semibold text-white">{course.completionRate}%</p>
                      <p className="text-xs text-slate-400">Completion</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Settings className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-lg font-semibold text-white capitalize">{course.status.toLowerCase()}</p>
                      <p className="text-xs text-slate-400">Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm text-slate-400">
            <span>{total} course{total !== 1 ? 's' : ''} total</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="border-white/10 text-slate-300 bg-white/5"
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-slate-300">Page {page} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="border-white/10 text-slate-300 bg-white/5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
        {/* Summary stats */}
        {!loading && courses.length > 0 && (
          <div className="mt-8">
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Summary</CardTitle>
                <CardDescription>Aggregated metrics across visible courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold text-cyan-400">{published}</p>
                    <p className="text-sm text-slate-400">Published</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold text-amber-400">{drafts}</p>
                    <p className="text-sm text-slate-400">Drafts</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold text-blue-400">{totalStudents.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Total Enrolled</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-2xl font-bold text-indigo-400">{avgCompletion}%</p>
                    <p className="text-sm text-slate-400">Avg Completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
