"use client";
import CourseModulePage from "@/components/CourseModulePage";
import { useParams, notFound } from "next/navigation";
import { courses } from "@/lib/courses";
import { coursesWithPath } from "@/lib/courseData";
import { eips101Content, ens101Content } from "@/lib/lessonContentMap";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  
  // Try to find in enhanced data first
  const enhancedCourse = coursesWithPath.find(c => c.id === courseId);
  const basicCourse = courses.find(c => c.id === courseId);
  const course = enhancedCourse || basicCourse;
  
  if (!course) {
    return notFound();
  }

  // Map enhanced modules to the format expected by CourseModulePage
  // and inject lesson content from our map
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
  })) : (course as any).modules || [
    {
      id: "mod-1",
      title: "Introduction",
      description: `Welcome to ${course.title}. This course will guide you through the essentials of ${(course as any).category || (course as any).learningPath}.`,
      lessons: [
        {
          id: `${course.id}-l1`,
          lessonNumber: 1,
          title: "The Big Picture",
          duration: "10 mins",
          type: "reading",
          xpReward: 10,
          difficulty: "Beginner",
          content: `In this first lesson, we explore why ${course.title} is critical for the evolving Web3 ecosystem.`,
          keyTakeaways: ["Core concepts", "History", "Future outlook"],
          quiz: {
            questions: [
              {
                id: "q1",
                question: "Wait, is this real?",
                options: ["Yes", "No", "Maybe", "I hope so"],
                correct: 0,
                explanation: "Correct! You are learning on the future of education."
              }
            ]
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <CourseModulePage 
        courseId={course.id}
        courseName={course.title}
        modules={moduleData}
        totalLessons={enhancedCourse ? enhancedCourse.totalLessons : (course as any).lessons || 1}
      />
    </div>
  );
}
