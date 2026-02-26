'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, ArrowUp, ArrowDown, BookOpen, Code, FileText, Film, Layers,
  Loader2, Pencil, Play, Plus, Send, Trash2, HelpCircle, Youtube, GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

/* ─── Types ─── */
interface ContentBlock {
  id: string;
  type: 'TEXT' | 'VIDEO' | 'YOUTUBE' | 'CODE' | 'QUIZ';
  order: number;
  textContent: string | null;
  videoUrl: string | null;
  codeLanguage: string | null;
  quizData: any;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: number | null;
  sectionId: string | null;
  contentBlocks: ContentBlock[];
  section?: { id: string; title: string } | null;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: { id: string; title: string; order: number }[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  level: string;
  rejectionReason: string | null;
  sections: Section[];
  lessons: Lesson[]; // lessons without section
  _count: { users: number };
}

/* ─── Block type config ─── */
const blockTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  TEXT: { label: 'Text / Markdown', icon: FileText, color: 'text-blue-400' },
  VIDEO: { label: 'Video Upload', icon: Film, color: 'text-purple-400' },
  YOUTUBE: { label: 'YouTube Embed', icon: Youtube, color: 'text-red-400' },
  CODE: { label: 'Code Snippet', icon: Code, color: 'text-emerald-400' },
  QUIZ: { label: 'Quiz', icon: HelpCircle, color: 'text-amber-400' },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-amber-500/10 text-amber-400 border-amber-400/20' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', className: 'bg-blue-500/10 text-blue-400 border-blue-400/20' },
  PUBLISHED: { label: 'Published', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' },
  REJECTED: { label: 'Needs Revision', className: 'bg-red-500/10 text-red-400 border-red-400/20' },
};

export default function InstructorCourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Section dialog
  const [sectionDialog, setSectionDialog] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [creatingSec, setCreatingSec] = useState(false);

  // Lesson dialog
  const [lessonDialog, setLessonDialog] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSectionId, setLessonSectionId] = useState<string>('none');
  const [lessonDuration, setLessonDuration] = useState('');
  const [creatingLesson, setCreatingLesson] = useState(false);

  // Content block dialog
  const [blockDialog, setBlockDialog] = useState(false);
  const [blockLessonId, setBlockLessonId] = useState('');
  const [blockType, setBlockType] = useState<string>('TEXT');
  const [blockText, setBlockText] = useState('');
  const [blockVideoUrl, setBlockVideoUrl] = useState('');
  const [blockCodeLang, setBlockCodeLang] = useState('javascript');
  const [blockQuizData, setBlockQuizData] = useState('');
  const [creatingBlock, setCreatingBlock] = useState(false);

  // Edit content block
  const [editBlock, setEditBlock] = useState<ContentBlock | null>(null);
  const [editBlockText, setEditBlockText] = useState('');
  const [editBlockVideoUrl, setEditBlockVideoUrl] = useState('');
  const [editBlockCodeLang, setEditBlockCodeLang] = useState('');
  const [editBlockQuizData, setEditBlockQuizData] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'lesson' | 'block'; id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded lessons
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const fetchCourse = useCallback(async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`/api/instructor/courses/${courseId}`),
        fetch(`/api/instructor/courses/${courseId}/lessons`),
      ]);
      if (!courseRes.ok) throw new Error();
      const courseData = await courseRes.json();
      const lessonsData = lessonsRes.ok ? await lessonsRes.json() : { lessons: [] };
      setCourse(courseData);
      setAllLessons(lessonsData.lessons ?? []);
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const canEdit = course?.status === 'DRAFT' || course?.status === 'REJECTED';

  /* ─── Section CRUD ─── */
  async function handleCreateSection(e: React.FormEvent) {
    e.preventDefault();
    if (!sectionTitle.trim()) return;
    setCreatingSec(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: sectionTitle.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Section added');
      setSectionDialog(false);
      setSectionTitle('');
      fetchCourse();
    } catch (err: any) { toast.error(err.message); }
    finally { setCreatingSec(false); }
  }

  /* ─── Lesson CRUD ─── */
  async function handleCreateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setCreatingLesson(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonTitle.trim(),
          sectionId: lessonSectionId === 'none' ? undefined : lessonSectionId,
          duration: lessonDuration ? Number(lessonDuration) : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Lesson added');
      setLessonDialog(false);
      setLessonTitle('');
      setLessonSectionId('none');
      setLessonDuration('');
      fetchCourse();
    } catch (err: any) { toast.error(err.message); }
    finally { setCreatingLesson(false); }
  }

  /* ─── Content Block CRUD ─── */
  async function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();
    setCreatingBlock(true);
    try {
      const payload: any = { lessonId: blockLessonId, type: blockType };
      if (blockType === 'TEXT' || blockType === 'CODE') payload.textContent = blockText;
      if (blockType === 'VIDEO' || blockType === 'YOUTUBE') payload.videoUrl = blockVideoUrl;
      if (blockType === 'CODE') payload.codeLanguage = blockCodeLang;
      if (blockType === 'QUIZ') {
        try { payload.quizData = JSON.parse(blockQuizData); }
        catch { toast.error('Invalid quiz JSON'); setCreatingBlock(false); return; }
      }

      const res = await fetch(`/api/instructor/courses/${courseId}/content-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Content block added');
      setBlockDialog(false);
      resetBlockForm();
      fetchCourse();
    } catch (err: any) { toast.error(err.message); }
    finally { setCreatingBlock(false); }
  }

  async function handleEditBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!editBlock) return;
    setSavingBlock(true);
    try {
      const payload: any = { blockId: editBlock.id };
      if (editBlock.type === 'TEXT' || editBlock.type === 'CODE') payload.textContent = editBlockText;
      if (editBlock.type === 'VIDEO' || editBlock.type === 'YOUTUBE') payload.videoUrl = editBlockVideoUrl;
      if (editBlock.type === 'CODE') payload.codeLanguage = editBlockCodeLang;
      if (editBlock.type === 'QUIZ') {
        try { payload.quizData = JSON.parse(editBlockQuizData); }
        catch { toast.error('Invalid quiz JSON'); setSavingBlock(false); return; }
      }

      const res = await fetch(`/api/instructor/courses/${courseId}/content-blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Block updated');
      setEditBlock(null);
      fetchCourse();
    } catch (err: any) { toast.error(err.message); }
    finally { setSavingBlock(false); }
  }

  function resetBlockForm() {
    setBlockText(''); setBlockVideoUrl(''); setBlockCodeLang('javascript'); setBlockQuizData(''); setBlockType('TEXT');
  }

  function openEditBlock(block: ContentBlock) {
    setEditBlock(block);
    setEditBlockText(block.textContent || '');
    setEditBlockVideoUrl(block.videoUrl || '');
    setEditBlockCodeLang(block.codeLanguage || 'javascript');
    setEditBlockQuizData(block.quizData ? JSON.stringify(block.quizData, null, 2) : '');
  }

  /* ─── Delete handler ─── */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const urlMap = {
        section: `/api/instructor/courses/${courseId}/sections?id=${deleteTarget.id}`,
        lesson: `/api/instructor/courses/${courseId}/lessons?id=${deleteTarget.id}`,
        block: `/api/instructor/courses/${courseId}/content-blocks?id=${deleteTarget.id}`,
      };
      const res = await fetch(urlMap[deleteTarget.type], { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`${deleteTarget.type === 'block' ? 'Content block' : deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted`);
      setDeleteTarget(null);
      fetchCourse();
    } catch (err: any) { toast.error(err.message); }
    finally { setDeleting(false); }
  }

  /* ─── Submit for approval ─── */
  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/submit`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Course submitted for admin review!');
      fetchCourse();
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  function toggleLesson(id: string) {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>;
  }
  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Course not found.</div>;
  }

  const cfg = statusConfig[course.status] || statusConfig.DRAFT;

  // Organize lessons: by section + unsectioned
  const sectionedView = course.sections.map(s => ({
    ...s,
    lessons: allLessons.filter(l => l.sectionId === s.id).sort((a, b) => a.order - b.order),
  }));
  const unsectionedLessons = allLessons.filter(l => !l.sectionId).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
              <Link href="/instructor/courses"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                <Badge variant="outline" className="text-slate-400 border-white/10 capitalize">{course.level.toLowerCase()}</Badge>
              </div>
              {course.description && <p className="text-slate-400 text-sm mt-1">{course.description}</p>}
              {course.rejectionReason && (
                <p className="text-sm text-red-400 mt-2 bg-red-500/10 rounded p-3 border border-red-500/20">
                  Admin feedback: {course.rejectionReason}
                </p>
              )}
            </div>
            {canEdit && allLessons.length > 0 && (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shrink-0">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" />Submit for Review</>}
              </Button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {canEdit && (
          <div className="flex gap-3 mb-8 flex-wrap">
            <Button onClick={() => setSectionDialog(true)} variant="outline" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
              <Layers className="h-4 w-4 mr-2" />Add Section
            </Button>
            <Button onClick={() => setLessonDialog(true)} variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <Plus className="h-4 w-4 mr-2" />Add Lesson
            </Button>
          </div>
        )}

        {/* Section Dialog */}
        <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Section</DialogTitle>
              <DialogDescription className="text-slate-400">Sections help organize lessons into logical groups.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Section Title</Label>
                <Input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)}
                  placeholder="e.g. Getting Started" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" required minLength={2} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSectionDialog(false)} className="border-white/10 text-slate-300 bg-white/5">Cancel</Button>
                <Button type="submit" disabled={creatingSec} className="bg-emerald-600 hover:bg-emerald-500">
                  {creatingSec ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Section'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Lesson</DialogTitle>
              <DialogDescription className="text-slate-400">Create a new lesson. You&apos;ll add content blocks after.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Lesson Title</Label>
                <Input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                  placeholder="e.g. Introduction to Smart Contracts" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" required minLength={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Section (optional)</Label>
                <Select value={lessonSectionId} onValueChange={setLessonSectionId}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                    <SelectItem value="none">No section (standalone)</SelectItem>
                    {course.sections.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Duration (minutes)</Label>
                <Input value={lessonDuration} onChange={e => setLessonDuration(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 15" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 w-32" type="number" min={1} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setLessonDialog(false)} className="border-white/10 text-slate-300 bg-white/5">Cancel</Button>
                <Button type="submit" disabled={creatingLesson} className="bg-emerald-600 hover:bg-emerald-500">
                  {creatingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Lesson'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Content Block Dialog */}
        <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Add Content Block</DialogTitle>
              <DialogDescription className="text-slate-400">Add a text, video, code, or quiz block to this lesson.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Block Type</Label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(blockTypeConfig).map(([type, { label, icon: Icon, color }]) => (
                    <button key={type} type="button" onClick={() => setBlockType(type)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        blockType === type ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}>
                      <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                      <span className="text-[10px] text-slate-300">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(blockType === 'TEXT') && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Content (Markdown supported)</Label>
                  <Textarea value={blockText} onChange={e => setBlockText(e.target.value)}
                    rows={10} className="bg-white/5 border-white/10 text-white font-mono text-sm placeholder:text-slate-500"
                    placeholder="Write your lesson content here using Markdown..." />
                </div>
              )}

              {(blockType === 'VIDEO') && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Video URL (direct link to mp4 or video hosting)</Label>
                  <Input value={blockVideoUrl} onChange={e => setBlockVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                </div>
              )}

              {(blockType === 'YOUTUBE') && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">YouTube URL or Embed URL</Label>
                  <Input value={blockVideoUrl} onChange={e => setBlockVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                </div>
              )}

              {(blockType === 'CODE') && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Language</Label>
                    <Select value={blockCodeLang} onValueChange={setBlockCodeLang}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white w-48"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        {['javascript','typescript','solidity','python','rust','go','html','css','json','bash','sql'].map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-sm">Code</Label>
                    <Textarea value={blockText} onChange={e => setBlockText(e.target.value)}
                      rows={10} className="bg-white/5 border-white/10 text-white font-mono text-sm placeholder:text-slate-500"
                      placeholder="// Paste your code here..." />
                  </div>
                </>
              )}

              {(blockType === 'QUIZ') && (
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Quiz Data (JSON)</Label>
                  <Textarea value={blockQuizData} onChange={e => setBlockQuizData(e.target.value)}
                    rows={12} className="bg-white/5 border-white/10 text-white font-mono text-xs placeholder:text-slate-500"
                    placeholder={`{\n  "questions": [\n    {\n      "question": "What is Ethereum?",\n      "options": ["A blockchain", "A database", "An API", "A language"],\n      "correct": 0,\n      "explanation": "Ethereum is a decentralized blockchain platform."\n    }\n  ],\n  "passingScore": 70\n}`} />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setBlockDialog(false); resetBlockForm(); }} className="border-white/10 text-slate-300 bg-white/5">Cancel</Button>
                <Button type="submit" disabled={creatingBlock} className="bg-emerald-600 hover:bg-emerald-500">
                  {creatingBlock ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Block'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Block Dialog */}
        <Dialog open={!!editBlock} onOpenChange={open => { if (!open) setEditBlock(null); }}>
          <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Edit {editBlock ? blockTypeConfig[editBlock.type]?.label : ''} Block</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditBlock} className="space-y-4">
              {editBlock?.type === 'TEXT' && (
                <Textarea value={editBlockText} onChange={e => setEditBlockText(e.target.value)} rows={12}
                  className="bg-white/5 border-white/10 text-white font-mono text-sm" />
              )}
              {editBlock?.type === 'VIDEO' && (
                <Input value={editBlockVideoUrl} onChange={e => setEditBlockVideoUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white" />
              )}
              {editBlock?.type === 'YOUTUBE' && (
                <Input value={editBlockVideoUrl} onChange={e => setEditBlockVideoUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white" />
              )}
              {editBlock?.type === 'CODE' && (
                <>
                  <Select value={editBlockCodeLang} onValueChange={setEditBlockCodeLang}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white w-48"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                      {['javascript','typescript','solidity','python','rust','go','html','css','json','bash','sql'].map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea value={editBlockText} onChange={e => setEditBlockText(e.target.value)} rows={12}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm" />
                </>
              )}
              {editBlock?.type === 'QUIZ' && (
                <Textarea value={editBlockQuizData} onChange={e => setEditBlockQuizData(e.target.value)} rows={12}
                  className="bg-white/5 border-white/10 text-white font-mono text-xs" />
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditBlock(null)} className="border-white/10 text-slate-300 bg-white/5">Cancel</Button>
                <Button type="submit" disabled={savingBlock} className="bg-blue-600 hover:bg-blue-500">
                  {savingBlock ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
          <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will permanently delete &quot;{deleteTarget?.name}&quot;. This cannot be undone.
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

        {/* Course structure */}
        <div className="space-y-6">
          {/* Sections with lessons */}
          {sectionedView.map((section) => (
            <Card key={section.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-cyan-400" />
                    <CardTitle className="text-lg text-white">{section.title}</CardTitle>
                    <Badge variant="outline" className="text-slate-400 border-white/10 text-xs">{section.lessons.length} lessons</Badge>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteTarget({ type: 'section', id: section.id, name: section.title })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={allLessons.find(l => l.id === lesson.id)!}
                    expanded={expandedLessons.has(lesson.id)} onToggle={() => toggleLesson(lesson.id)}
                    canEdit={!!canEdit} onAddBlock={() => { setBlockLessonId(lesson.id); setBlockDialog(true); }}
                    onEditBlock={openEditBlock}
                    onDelete={(type, id, name) => setDeleteTarget({ type, id, name })} />
                ))}
                {section.lessons.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No lessons in this section yet.</p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Unsectioned lessons */}
          {unsectionedLessons.length > 0 && (
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                  <CardTitle className="text-lg text-white">Standalone Lessons</CardTitle>
                  <Badge variant="outline" className="text-slate-400 border-white/10 text-xs">{unsectionedLessons.length} lessons</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {unsectionedLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson}
                    expanded={expandedLessons.has(lesson.id)} onToggle={() => toggleLesson(lesson.id)}
                    canEdit={!!canEdit} onAddBlock={() => { setBlockLessonId(lesson.id); setBlockDialog(true); }}
                    onEditBlock={openEditBlock}
                    onDelete={(type, id, name) => setDeleteTarget({ type, id, name })} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {allLessons.length === 0 && course.sections.length === 0 && (
            <Card className="bg-slate-900/40 border border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
                <BookOpen className="h-12 w-12 mb-3 opacity-30" />
                <p className="mb-2 text-white font-medium">Start building your course</p>
                <p className="text-sm mb-6">Add sections to organize content, then add lessons with text, video, code, and quizzes.</p>
                <div className="flex gap-3">
                  <Button onClick={() => setSectionDialog(true)} variant="outline" className="border-white/10 text-slate-300 bg-white/5">
                    <Layers className="h-4 w-4 mr-2" />Add Section
                  </Button>
                  <Button onClick={() => setLessonDialog(true)} className="bg-emerald-600 hover:bg-emerald-500">
                    <Plus className="h-4 w-4 mr-2" />Add Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Lesson Card sub-component ─── */
function LessonCard({ lesson, expanded, onToggle, canEdit, onAddBlock, onEditBlock, onDelete }: {
  lesson: Lesson;
  expanded: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onAddBlock: () => void;
  onEditBlock: (b: ContentBlock) => void;
  onDelete: (type: 'lesson' | 'block', id: string, name: string) => void;
}) {
  if (!lesson) return null;

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      {/* Lesson header */}
      <button onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left">
        <div className="flex items-center gap-3">
          <GripVertical className="h-4 w-4 text-slate-600" />
          <span className="font-medium text-white text-sm">{lesson.title}</span>
          {lesson.duration && <span className="text-xs text-slate-500">{lesson.duration} min</span>}
          <Badge variant="outline" className="text-slate-500 border-white/10 text-[10px]">
            {lesson.contentBlocks.length} blocks
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <span onClick={e => { e.stopPropagation(); onDelete('lesson', lesson.id, lesson.title); }}
              className="p-1 rounded hover:bg-red-500/20 cursor-pointer">
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </span>
          )}
          <ArrowDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/5 bg-white/[0.02] p-3 space-y-2">
          {lesson.contentBlocks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No content blocks yet.</p>
          ) : (
            lesson.contentBlocks.map((block) => {
              const cfg = blockTypeConfig[block.type];
              const Icon = cfg?.icon || FileText;
              return (
                <div key={block.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="shrink-0 mt-0.5">
                    <Icon className={`h-4 w-4 ${cfg?.color || 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300">{cfg?.label || block.type}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {block.type === 'TEXT' && (block.textContent?.substring(0, 100) || 'Empty')}
                      {block.type === 'CODE' && `${block.codeLanguage || 'code'}: ${block.textContent?.substring(0, 80) || 'Empty'}`}
                      {(block.type === 'VIDEO' || block.type === 'YOUTUBE') && (block.videoUrl || 'No URL')}
                      {block.type === 'QUIZ' && `${(block.quizData as any)?.questions?.length || 0} questions`}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => onEditBlock(block)} className="p-1 rounded hover:bg-white/10">
                        <Pencil className="h-3 w-3 text-blue-400" />
                      </button>
                      <button onClick={() => onDelete('block', block.id, cfg?.label || 'Block')} className="p-1 rounded hover:bg-red-500/20">
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {canEdit && (
            <Button onClick={onAddBlock} variant="outline" size="sm" className="w-full border-dashed border-white/10 text-slate-400 hover:text-white hover:bg-white/5">
              <Plus className="h-3.5 w-3.5 mr-1" />Add Content Block
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
