import { useEffect, useState, useCallback } from 'react';

type ProgressEventDetail = { courseSlug: string };
const eventName = 'course-progress-updated';

function storageKey(courseSlug: string) {
  return `${courseSlug}-completed`;
}

export function useCourseProgress(courseSlug: string, totalModules?: number) {
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // 1. Try DB first
        const dbRes = await fetch(`/api/user/course/progress?courseSlug=${courseSlug}`);
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          if (dbData.completedModules?.length > 0) {
            const dbSet = new Set<number>(dbData.completedModules);
            setCompletedModules(dbSet);
            // Sync to local
            localStorage.setItem(storageKey(courseSlug), JSON.stringify(Array.from(dbSet)));
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to localStorage
        const saved = localStorage.getItem(storageKey(courseSlug));
        if (saved) setCompletedModules(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Progress load error", e);
        setCompletedModules(new Set());
      } finally {
        setLoading(false);
      }
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(courseSlug)) {
        // reload from local storage only
        try {
          const saved = localStorage.getItem(storageKey(courseSlug));
          if (saved) setCompletedModules(new Set(JSON.parse(saved)));
        } catch (err) { /* ignore */ }
      }
    };

    const onCustom = (e: Event) => {
      try {
        // @ts-ignore
        const d: ProgressEventDetail = e.detail;
        if (d?.courseSlug === courseSlug) load();
      } catch (err) { /* ignore */ }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(eventName, onCustom as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(eventName, onCustom as EventListener);
    };
  }, [courseSlug]);

  const markModuleComplete = useCallback(async (moduleId: number) => {
    try {
      const saved = localStorage.getItem(storageKey(courseSlug));
      const arr: number[] = saved ? JSON.parse(saved) : [];
      if (!arr.includes(moduleId)) arr.push(moduleId);
      localStorage.setItem(storageKey(courseSlug), JSON.stringify(arr));
      
      // dispatch custom event for same-window updates
      window.dispatchEvent(new CustomEvent(eventName, { detail: { courseSlug } }));
      setCompletedModules(new Set(arr));

      // Sync to DB
      if (totalModules) {
        await fetch('/api/user/course/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseSlug,
            completedModules: arr,
            completedCount: arr.length,
            totalModules
          })
        });
      }
    } catch (err) {
      console.error('useCourseProgress markModuleComplete error', err);
    }
  }, [courseSlug, totalModules]);

  const markModuleIncomplete = useCallback(async (moduleId: number) => {
    try {
      const saved = localStorage.getItem(storageKey(courseSlug));
      const arr: number[] = saved ? JSON.parse(saved) : [];
      const filtered = arr.filter((n) => n !== moduleId);
      localStorage.setItem(storageKey(courseSlug), JSON.stringify(filtered));
      
      window.dispatchEvent(new CustomEvent(eventName, { detail: { courseSlug } }));
      setCompletedModules(new Set(filtered));

      // Sync to DB
      if (totalModules) {
        await fetch('/api/user/course/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseSlug,
            completedModules: filtered,
            completedCount: filtered.length,
            totalModules
          })
        });
      }
    } catch (err) {
      console.error('useCourseProgress markModuleIncomplete error', err);
    }
  }, [courseSlug, totalModules]);

  const clearProgress = useCallback(async () => {
    localStorage.removeItem(storageKey(courseSlug));
    window.dispatchEvent(new CustomEvent(eventName, { detail: { courseSlug } }));
    setCompletedModules(new Set());

    // Reset in DB
    try {
        await fetch('/api/user/course/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseSlug,
                completedModules: [],
                completedCount: 0,
                totalModules: totalModules || 1
            })
        });
    } catch (err) {
        console.error('Reset progress error', err);
    }
  }, [courseSlug, totalModules]);

  const completionCount = completedModules.size;
  const percent = totalModules ? (completionCount / totalModules) * 100 : 0;

  return {
    completedModules,
    markModuleComplete,
    markModuleIncomplete,
    clearProgress,
    completionCount,
    percent,
    loading
  };
}
