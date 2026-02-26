'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), level, category: category.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create course');
      }
      const course = await res.json();
      toast.success('Course created! Now add sections and lessons.');
      router.push(`/instructor/courses/${course.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline" size="sm" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10">
            <Link href="/instructor/courses"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
          </Button>
        </div>

        <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-400" />
              Create New Course
            </CardTitle>
            <CardDescription className="text-slate-400">
              Start with the basics. You&apos;ll add sections, lessons, and content in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Course Title <span className="text-red-400">*</span></Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Solidity 101: Smart Contracts from Scratch"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                  required
                  minLength={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Description <span className="text-red-400">*</span></Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What will learners gain from this course? Describe the key topics and outcomes."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500 resize-none"
                  required
                  minLength={10}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
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
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-sm">Category</Label>
                  <Input
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Smart Contracts"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="border-white/10 text-slate-300 bg-white/5 hover:bg-white/10" onClick={() => router.back()} disabled={creating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Course'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
