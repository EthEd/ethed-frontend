import { prisma } from "./prisma-client";

const XP_PER_LESSON = 10;
const XP_FOR_STREAK = 5;

export async function addXpAndProgress(userId: string, lessonId?: string, customXp?: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, streak: true, lastLearnedAt: true },
  });

  if (!user) return null;

  let newXp = user.xp + (customXp || XP_PER_LESSON);
  let newStreak = user.streak;
  const now = new Date();
  const lastLearned = user.lastLearnedAt;

  // Streak logic
  if (lastLearned) {
    const lastDate = new Date(lastLearned);
    const diffInDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      // Consecutive day
      newStreak += 1;
      newXp += XP_FOR_STREAK;
    } else if (diffInDays > 1) {
      // Streak broken
      newStreak = 1;
    }
  } else {
    // First time learning
    newStreak = 1;
  }

  // Level logic (simple: every 100 XP is a level)
  const newLevel = Math.floor(newXp / 100) + 1;

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastLearnedAt: now,
    },
  });

  // Log lesson progress if provided
  if (lessonId) {
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        lessonId,
        completed: true,
      },
    });
  }

  return updatedUser;
}
