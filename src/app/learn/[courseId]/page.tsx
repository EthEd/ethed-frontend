"use client";
import CourseModulePage from "@/components/CourseModulePage";
import { useParams, notFound } from "next/navigation";
import { courses } from "@/lib/courses";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return notFound();
  }

  // Inject content for the demo if it's one of our "real" courses
  const moduleData = course.modules || [
    {
      id: "mod-1",
      title: "Introduction",
      description: `Welcome to ${course.title}. This course will guide you through the essentials of ${course.category}.`,
      lessons: [
        {
          id: `${course.id}-l1`,
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
        totalLessons={course.lessons}
      />
    </div>
  );
}
