'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Loader2, Plus, ArrowLeft, Users, Layers, Send, Pencil, Trash2,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { toast } from 'sonner';

interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  status: string;
  level: string;
  description: string | null;
  rejectionReason: string | null;
  updatedAt: string;
  _count: { lessons: number; users: number; sections: number };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-amber-500/10 text-amber-400 border-amber-400/20' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', className: 'bg-blue-500/10 text-blue-400 border-blue-400/20' },
  PUBLISHED: { label: 'Published', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' },
  REJECTED: { label: 'Needs Revision', className: 'bg-red-500/10 text-red-400 border-red-400/20' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-500/10 text-slate-400 border-slate-400/20' },
};

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<InstructorCourse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function fetchCourses() {
    setLoading(true);
    try {
      const res = await fetch('/api/instructor/courses');
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchCourses(); }, []);

  async function handleSubmit(courseId: string) {
    setSubmitting(courseId);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/submit`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit');
      }
      toast.success('Course submitted for review!');
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/instructor/courses/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete');
      }
      toast.success('Course deleted');
      setDeleteTarget(null);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
              <Link href="/instructor"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Courses</h1>
              <p className="text-slate-400 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
            </div>
            <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-none">
              <Link href="/instructor/courses/new"><Plus className="h-4 w-4 mr-2" />New Course</Link>
            </Button>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete course?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will permanently delete &quot;{deleteTarget?.title}&quot; and all its lessons and content. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="bg-slate-900/40 border border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookOpen className="h-12 w-12 mb-3 opacity-30" />
              <p className="mb-4">You haven&apos;t created any courses yet.</p>
              <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Link href="/instructor/courses/new"><Plus className="h-4 w-4 mr-2" />Create Your First Course</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map(course => {
              const cfg = statusConfig[course.status] || statusConfig.DRAFT;
              const canEdit = course.status === 'DRAFT' || course.status === 'REJECTED';
              const canSubmit = canEdit && course._count.lessons > 0;
              const canDelete = course.status !== 'PUBLISHED';

              return (
                <Card key={course.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <CardTitle className="text-lg text-white truncate">{course.title}</CardTitle>
                          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                          <Badge variant="outline" className="text-slate-400 border-white/10 capitalize">{course.level.toLowerCase()}</Badge>
                        </div>
                        <CardDescription className="text-slate-500 text-xs">
                          Updated {new Date(course.updatedAt).toLocaleDateString()}
                        </CardDescription>
                        {course.rejectionReason && (
                          <p className="text-xs text-red-400 mt-2 bg-red-500/10 rounded p-2 border border-red-500/20">
                            Feedback: {course.rejectionReason}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {canEdit && (
                          <Button asChild size="sm" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                            <Link href={`/instructor/courses/${course.id}`}>
                              <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                            </Link>
                          </Button>
                        )}
                        {canSubmit && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => handleSubmit(course.id)}
                            disabled={submitting === course.id}
                          >
                            {submitting === course.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <><Send className="h-3.5 w-3.5 mr-1" />Submit</>
                            )}
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeleteTarget(course)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-6 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{course._count.sections} sections</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course._count.lessons} lessons</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course._count.users} students</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
