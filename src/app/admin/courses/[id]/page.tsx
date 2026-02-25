'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  status: string;
  level: string;
  lessons: Lesson[];
}

export default function AdminCourseLessonsPage() {
  const { id: courseId } = useParams<{ id: string }>();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Add lesson dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addContent, setAddContent] = useState('');
  const [addDuration, setAddDuration] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit lesson dialog
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons`);
      if (!res.ok) throw new Error('Failed to load course');
      const data = await res.json();
      setCourse(data);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  function openEditDialog(lesson: Lesson) {
    setEditLesson(lesson);
    setEditTitle(lesson.title);
    setEditContent(lesson.content);
    setEditDuration(lesson.duration ? String(lesson.duration) : '');
  }

  async function handleAddLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!addTitle.trim() || addTitle.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (!addContent.trim()) {
      toast.error('Content is required');
      return;
    }
    setAdding(true);
    try {
      const body: Record<string, unknown> = {
        title: addTitle.trim(),
        content: addContent.trim(),
      };
      if (addDuration) body.duration = Number(addDuration);
      const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to add lesson');
      }
      toast.success('Lesson added');
      setAddOpen(false);
      setAddTitle('');
      setAddContent('');
      setAddDuration('');
      fetchCourse();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add lesson');
    } finally {
      setAdding(false);
    }
  }

  async function handleEditLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!editLesson) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        lessonId: editLesson.id,
        title: editTitle.trim(),
        content: editContent.trim(),
        duration: editDuration ? Number(editDuration) : null,
      };
      const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to update lesson');
      }
      toast.success('Lesson updated');
      setEditLesson(null);
      fetchCourse();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson() {
    if (!deleteLesson) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/lessons?id=${deleteLesson.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to delete lesson');
      }
      toast.success('Lesson deleted');
      setDeleteLesson(null);
      fetchCourse();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete lesson');
    } finally {
      setDeleting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Course not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
            >
              <Link href="/admin/courses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Link>
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <Badge variant="outline" className={getStatusColor(course.status)}>
                  {course.status.toLowerCase()}
                </Badge>
                <Badge variant="outline" className="text-slate-400 border-white/10 capitalize">
                  {course.level.toLowerCase()}
                </Badge>
              </div>
              <p className="text-slate-400 text-sm">
                {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-none shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        </div>

        {/* ── Add Lesson Dialog ── */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-cyan-400" />
                Add New Lesson
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a lesson to <strong className="text-white">{course.title}</strong>.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLesson} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Title <span className="text-red-400">*</span></Label>
                <Input
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  placeholder="e.g. Introduction to Smart Contracts"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  required
                  minLength={3}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Content <span className="text-red-400">*</span></Label>
                <Textarea
                  value={addContent}
                  onChange={e => setAddContent(e.target.value)}
                  placeholder="Lesson content (markdown supported)"
                  rows={8}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Duration (minutes) <span className="text-slate-500">(optional)</span></Label>
                <Input
                  value={addDuration}
                  onChange={e => setAddDuration(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 15"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 w-32"
                  type="number"
                  min={1}
                />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                  onClick={() => setAddOpen(false)}
                  disabled={adding}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white min-w-[110px]"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Lesson'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Edit Lesson Dialog ── */}
        <Dialog
          open={!!editLesson}
          onOpenChange={open => { if (!open) setEditLesson(null); }}
        >
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-400" />
                Edit Lesson
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Update the lesson details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditLesson} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Title <span className="text-red-400">*</span></Label>
                <Input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  required
                  minLength={3}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Content <span className="text-red-400">*</span></Label>
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={10}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">Duration (minutes)</Label>
                <Input
                  value={editDuration}
                  onChange={e => setEditDuration(e.target.value.replace(/\D/g, ''))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 w-32"
                  type="number"
                  min={1}
                />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                  onClick={() => setEditLesson(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm ── */}
        <AlertDialog
          open={!!deleteLesson}
          onOpenChange={open => { if (!open) setDeleteLesson(null); }}
        >
          <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will permanently delete &quot;{deleteLesson?.title}&quot; and all associated
                lesson progress. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteLesson}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Lesson list */}
        {course.lessons.length === 0 ? (
          <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookOpen className="h-12 w-12 mb-3 opacity-30" />
              <p className="mb-4">No lessons yet.</p>
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {course.lessons.map((lesson, index) => (
              <Card
                key={lesson.id}
                className="bg-slate-900/40 backdrop-blur-xl border border-white/10"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-600 font-mono text-sm mt-0.5 shrink-0">
                        #{index + 1}
                      </span>
                      <div>
                        <CardTitle className="text-base text-white font-medium">
                          {lesson.title}
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs mt-1">
                          Updated {new Date(lesson.updatedAt).toLocaleDateString()}
                          {lesson.duration && (
                            <span className="ml-3 inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.duration} min
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => openEditDialog(lesson)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteLesson(lesson)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-slate-400 text-sm line-clamp-2 font-mono bg-white/3 rounded p-2 border border-white/5">
                    {lesson.content.substring(0, 200)}{lesson.content.length > 200 ? '…' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
