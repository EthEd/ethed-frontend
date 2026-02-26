'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BookOpen, CheckCircle, Clock, Eye, Layers, Loader2, MessageSquare,
  Shield, User, XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ReviewCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  category: string | null;
  status: string;
  updatedAt: string;
  creator: { id: string; name: string | null; email: string | null } | null;
  _count: { lessons: number; sections: number };
  lessons: { id: string; title: string; order: number; _count: { contentBlocks: number } }[];
  sections: { id: string; title: string; order: number }[];
}

export default function AdminReviewsPage() {
  const [courses, setCourses] = useState<ReviewCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Approve dialog
  const [approveTarget, setApproveTarget] = useState<ReviewCourse | null>(null);
  const [approving, setApproving] = useState(false);

  // Reject dialog
  const [rejectTarget, setRejectTarget] = useState<ReviewCourse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Preview dialog
  const [previewTarget, setPreviewTarget] = useState<ReviewCourse | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch {
      toast.error('Failed to load courses for review');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  async function handleApprove() {
    if (!approveTarget) return;
    setApproving(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: approveTarget.id, action: 'approve' }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`"${approveTarget.title}" has been published!`);
      setApproveTarget(null);
      fetchCourses();
    } catch (err: any) { toast.error(err.message); }
    finally { setApproving(false); }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: rejectTarget.id, action: 'reject', reason: rejectReason.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`"${rejectTarget.title}" has been sent back for revision.`);
      setRejectTarget(null);
      setRejectReason('');
      fetchCourses();
    } catch (err: any) { toast.error(err.message); }
    finally { setRejecting(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Course Reviews</h1>
          {courses.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/20 ml-2">
              {courses.length} pending
            </Badge>
          )}
        </div>
        <p className="text-slate-400 text-sm">Review and approve courses submitted by instructors.</p>
      </div>

      {courses.length === 0 ? (
        <Card className="bg-slate-900/40 border border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CheckCircle className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium text-white">All clear!</p>
            <p className="text-sm">No courses waiting for review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                      <Badge variant="outline" className="text-amber-300 border-amber-400/20 bg-amber-500/10 text-xs">
                        <Clock className="h-3 w-3 mr-1" />Awaiting Review
                      </Badge>
                      <Badge variant="outline" className="text-slate-400 border-white/10 capitalize text-xs">
                        {course.level.toLowerCase()}
                      </Badge>
                      {course.category && (
                        <Badge variant="outline" className="text-slate-400 border-white/10 text-xs">
                          {course.category}
                        </Badge>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{course.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {course.creator?.name || course.creator?.email || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {course._count.sections} sections
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course._count.lessons} lessons
                      </span>
                      <span>
                        Submitted {new Date(course.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setPreviewTarget(course)}
                      className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
                      <Eye className="h-4 w-4 mr-1" />Preview
                    </Button>
                    <Button size="sm" onClick={() => setRejectTarget(course)}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30">
                      <XCircle className="h-4 w-4 mr-1" />Reject
                    </Button>
                    <Button size="sm" onClick={() => setApproveTarget(course)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Confirm */}
      <AlertDialog open={!!approveTarget} onOpenChange={open => { if (!open) setApproveTarget(null); }}>
        <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve &amp; publish this course?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              &quot;{approveTarget?.title}&quot; will be published and visible to all learners immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={approving} className="bg-emerald-600 hover:bg-emerald-500">
              {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve & Publish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={open => { if (!open) { setRejectTarget(null); setRejectReason(''); }}}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Course</DialogTitle>
            <DialogDescription className="text-slate-400">
              Provide feedback so the instructor can revise &quot;{rejectTarget?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-slate-300 text-sm">Reason for rejection</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Describe what needs to be improved..." rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(''); }}
              className="border-white/10 text-slate-300 bg-white/5">Cancel</Button>
            <Button onClick={handleReject} disabled={rejecting || !rejectReason.trim()} className="bg-red-600 hover:bg-red-700">
              {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTarget} onOpenChange={open => { if (!open) setPreviewTarget(null); }}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{previewTarget?.title}</DialogTitle>
            <DialogDescription className="text-slate-400">{previewTarget?.description}</DialogDescription>
          </DialogHeader>
          {previewTarget && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-slate-400 border-white/10 capitalize">{previewTarget.level.toLowerCase()}</Badge>
                {previewTarget.category && <Badge variant="outline" className="text-slate-400 border-white/10">{previewTarget.category}</Badge>}
                <Badge variant="outline" className="text-slate-400 border-white/10">
                  {previewTarget._count.lessons} lessons
                </Badge>
              </div>

              {previewTarget.sections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300">Sections &amp; Lessons</h4>
                  {previewTarget.sections
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <div key={section.id} className="border border-white/5 rounded-lg p-3">
                        <p className="text-sm font-medium text-cyan-400 mb-2">{section.title}</p>
                        {previewTarget.lessons
                          .filter(l => true) // All lessons shown for review
                          .sort((a, b) => a.order - b.order)
                          .map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between py-1 px-2 text-sm">
                              <span className="text-slate-300">{lesson.title}</span>
                              <span className="text-xs text-slate-500">{lesson._count.contentBlocks} blocks</span>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}

              {previewTarget.lessons.length > 0 && previewTarget.sections.length === 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">Lessons</h4>
                  {previewTarget.lessons.sort((a, b) => a.order - b.order).map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between py-2 px-3 bg-white/[0.03] rounded border border-white/5 text-sm">
                      <span className="text-slate-300">{lesson.title}</span>
                      <span className="text-xs text-slate-500">{lesson._count.contentBlocks} blocks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
