"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { logger } from "@/lib/monitoring";

interface CourseFormData {
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: "BLOCKCHAIN" | "ETHEREUM" | "NFT" | "DEFI" | "OTHER";
  imageUrl?: string;
  slug?: string;
}

const DIFFICULTIES = [
  { id: "BEGINNER", label: "Beginner", color: "bg-green-500/10 text-green-400" },
  { id: "INTERMEDIATE", label: "Intermediate", color: "bg-yellow-500/10 text-yellow-400" },
  { id: "ADVANCED", label: "Advanced", color: "bg-red-500/10 text-red-400" },
];

const CATEGORIES = [
  { id: "BLOCKCHAIN", label: "Blockchain" },
  { id: "ETHEREUM", label: "Ethereum" },
  { id: "NFT", label: "NFT" },
  { id: "DEFI", label: "DeFi" },
  { id: "OTHER", label: "Other" },
];

interface CourseCreationFormProps {
  onSuccess?: () => void;
  courseId?: string;
  initialData?: Partial<CourseFormData>;
}

export default function CourseCreationForm({
  onSuccess,
  courseId,
  initialData,
}: CourseCreationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "BEGINNER",
    category: initialData?.category || "BLOCKCHAIN",
    imageUrl: initialData?.imageUrl || "",
    slug: initialData?.slug || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be at most 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    } else if (formData.description.length > 5000) {
      newErrors.description = "Description must be at most 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);

    try {
      const endpoint = courseId
        ? `/api/admin/courses?id=${courseId}`
        : "/api/admin/courses";
      const method = courseId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          courseId ? { courseId, ...formData } : formData
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(typeof result.error === 'string' ? result.error : (result.error ? JSON.stringify(result.error) : 'Failed to save course'));
        return;
      }

      toast.success(
        courseId ? "Course updated successfully" : "Course created successfully"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/courses");
      }
    } catch (error) {
      toast.error("An error occurred while saving the course");
      logger.error("Course save error", "CourseCreationForm", undefined, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/40 backdrop-blur-xl border border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-5 w-5 text-cyan-400" />
          {courseId ? "Edit Course" : "Create New Course"}
        </CardTitle>
        <CardDescription>
          {courseId
            ? "Update course details and settings"
            : "Add a new course to eth.ed"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-white mb-2 block">
              Course Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Ethereum Smart Contracts"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Slug (auto-generated) */}
          <div>
            <Label htmlFor="slug" className="text-white mb-2 block">
              URL Slug
            </Label>
            <Input
              id="slug"
              type="text"
              value={
                formData.slug ||
                formData.title.toLowerCase().replace(/\s+/g, "-")
              }
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="course-url-slug"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 text-sm"
            />
            <p className="text-slate-400 text-xs mt-1">
              Auto-generated from title if left empty
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-white mb-2 block">
              Description *
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed description of what students will learn..."
              rows={6}
              className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-3 py-2 font-mono text-sm"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-slate-400 text-xs mt-1">
              {formData.description.length}/5000 characters (minimum 50)
            </p>
          </div>

          {/* Difficulty */}
          <div>
            <Label className="text-white mb-3 block">Difficulty Level *</Label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      difficulty: diff.id as CourseFormData["difficulty"],
                    })
                  }
                  className={`p-3 rounded-lg border-2 transition-all text-center font-medium ${
                    formData.difficulty === diff.id
                      ? `border-cyan-400 ${diff.color} bg-opacity-20`
                      : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-white mb-3 block">Category *</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      category: cat.id as CourseFormData["category"],
                    })
                  }
                  className={`p-3 rounded-lg border-2 transition-all text-center text-sm font-medium ${
                    formData.category === cat.id
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl" className="text-white mb-2 block">
              Course Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl || ""}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/course-image.jpg"
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
            {formData.imageUrl && (
              <div className="mt-2 relative h-32 w-32 rounded-lg overflow-hidden border border-slate-700">
                <img
                  src={formData.imageUrl}
                  alt="Course preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect fill='%23374151' width='128' height='128'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border-none text-white"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {courseId ? "Update Course" : "Create Course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
