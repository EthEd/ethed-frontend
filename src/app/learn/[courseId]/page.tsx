"use client";
import CourseModulePage from "@/components/CourseModulePage";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { courses } from "@/lib/courses";
import { coursesWithPath } from "@/lib/courseData";
import { eips101Content, ens101Content } from "@/lib/lessonContentMap";
import { Loader2 } from "lucide-react";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();

  // ── Static lookup ──────────────────────────────────────────────────────────
  const enhancedCourse = coursesWithPath.find(c => c.id === courseId);
  const basicCourse = courses.find(c => c.id === courseId);
  const staticCourse = enhancedCourse || basicCourse;

  // ── DB fallback state ──────────────────────────────────────────────────────
  const [dbCourse, setDbCourse] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(!staticCourse);
  const [dbNotFound, setDbNotFound] = useState(false);

  useEffect(() => {
    if (staticCourse) return; // already found statically
    fetch(`/api/courses/${encodeURIComponent(courseId)}`)
      .then(async r => {
        if (!r.ok) { setDbNotFound(true); return; }
        setDbCourse(await r.json());
      })
      .catch(() => setDbNotFound(true))
      .finally(() => setDbLoading(false));
  }, [courseId, staticCourse]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!staticCourse && (dbNotFound || !dbCourse)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-2xl font-bold">Course not found</p>
        <p className="text-slate-400 text-sm">This course may have been removed or unpublished.</p>
      </div>
    );
  }

  // ── DB course rendering ────────────────────────────────────────────────────
  if (!staticCourse && dbCourse) {
    const moduleData = [
      {
        id: "mod-1",
        title: dbCourse.title,
        description: dbCourse.description,
        estimatedTime: `${dbCourse.lessons.length * 10} mins`,
        lessons: dbCourse.lessons,
      },
    ];
    return (
      <div className="min-h-screen bg-black">
        <CourseModulePage
          courseId={dbCourse.id}
          courseName={dbCourse.title}
          modules={moduleData}
          totalLessons={dbCourse.lessons.length}
        />
      </div>
    );
  }

  // ── Static course rendering ────────────────────────────────────────────────
  const moduleData = enhancedCourse ? enhancedCourse.modules.map(m => ({
    id: String(m.id),
    title: m.title,
    description: m.description,
    estimatedTime: m.estimatedTime,
    rewardBadge: m.rewardBadge,
    lessons: m.lessons.map(l => {
      let content = "";
      let lessonType = l.type;

      if (courseId === 'eips-101') {
        content = eips101Content[l.id] || "";
        if (l.id === 9) lessonType = 'quiz';
      }
      if (courseId === 'ens-101') {
        content = ens101Content[l.id] || "";
        if (l.id === 4) lessonType = 'quiz';
      }

      return {
        id: `${courseId}-l${l.id}`,
        lessonNumber: l.id,
        title: l.title,
        duration: `${l.duration} mins`,
        type: lessonType as any,
        xpReward: l.xpReward,
        difficulty: l.difficulty === 'Easy' ? 'Beginner' : l.difficulty === 'Medium' ? 'Intermediate' : 'Advanced',
        content: content,
        videoUrl: (l as any).videoUrl,
        keyTakeaways: l.keyTakeaways,
        quiz: l.id === 9 && courseId === 'eips-101' ? {
          questions: [
            { id: "q1", question: "Which EIP introduced the base fee mechanism?", options: ["EIP-20", "EIP-1559", "EIP-721", "EIP-4844"], correct: 1, explanation: "EIP-1559 introduced the base fee and burning mechanism." },
            { id: "q2", question: "ERC-20 is primarily a standard for?", options: ["Non-fungible tokens", "Token interoperability", "Layer 2 scaling", "Gas estimation"], correct: 1, explanation: "ERC-20 provides a standard interface for fungible tokens." },
            { id: "q3", question: "What does EIP stand for?", options: ["Ethereum Improvement Proposal", "Ethereum Integration Protocol", "External Improvement Plan", "Ether Implementation Patch"], correct: 0, explanation: "EIP stands for Ethereum Improvement Proposal." }
          ],
          passingScore: 70
        } : l.id === 4 && courseId === 'ens-101' ? {
          questions: [
            { id: "eq1", question: "What is the main benefit of ENS?", options: ["Cheaper gas fees", "Human-readable names for addresses", "Faster transactions", "Private messaging"], correct: 1, explanation: "ENS maps human-readable names to machine-readable identifiers." }
          ],
          passingScore: 100
        } : undefined
      };
    })
  })) : (basicCourse as any)?.modules || [
    {
      id: "mod-1",
      title: "Introduction",
      description: `Welcome to ${basicCourse!.title}.`,
      lessons: [
        {
          id: `${basicCourse!.id}-l1`,
          lessonNumber: 1,
          title: "The Big Picture",
          duration: "10 mins",
          type: "reading",
          xpReward: 10,
          difficulty: "Beginner",
          content: `In this first lesson, we explore why ${basicCourse!.title} is critical for the evolving Web3 ecosystem.`,
          keyTakeaways: ["Core concepts", "History", "Future outlook"],
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <CourseModulePage
        courseId={staticCourse!.id}
        courseName={staticCourse!.title}
        modules={moduleData}
        totalLessons={enhancedCourse ? enhancedCourse.totalLessons : (basicCourse as any)?.lessons || 1}
      />
    </div>
  );
}
