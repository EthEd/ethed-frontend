import { useEffect, useState, useCallback } from 'react';

type ProgressEventDetail = { courseSlug: string };
const eventName = 'course-progress-updated';

function storageKey(courseSlug: string) {
  return `${courseSlug}-completed`;
}

export function useCourseProgress(courseSlug: string, totalModules?: number) {
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(storageKey(courseSlug));
        if (saved) setCompletedModules(new Set(JSON.parse(saved)));
      } catch (e) {
        setCompletedModules(new Set());
      }
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(courseSlug)) {
        load();
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

  const markModuleComplete = useCallback((moduleId: number) => {
    try {
      const saved = localStorage.getItem(storageKey(courseSlug));
      const arr: number[] = saved ? JSON.parse(saved) : [];
      if (!arr.includes(moduleId)) arr.push(moduleId);
      localStorage.setItem(storageKey(courseSlug), JSON.stringify(arr));
      // dispatch custom event for same-window updates
      window.dispatchEvent(new CustomEvent(eventName, { detail: { courseSlug } }));
      setCompletedModules(new Set(arr));
    } catch (err) {
      console.error('useCourseProgress markModuleComplete error', err);
    }
  }, [courseSlug]);

  const markModuleIncomplete = useCallback((moduleId: number) => {
    try {
      const saved = localStorage.getItem(storageKey(courseSlug));
      const arr: number[] = saved ? JSON.parse(saved) : [];
      const filtered = arr.filter((n) => n !== moduleId);
      localStorage.setItem(storageKey(courseSlug), JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent(eventName, { detail: { courseSlug } }));
      setCompletedModules(new Set(filtered));
    } catch (err) {
      console.error('useCourseProgress markModuleIncomplete error', err);
    }
  }, [courseSlug]);

  const clearProgress = useCallback(() => {
    localStorage.removeItem(storageKey(courseSlug));
    window.dispatchEvent(new CustomEvent(eventName, { detail: { courseSlug } }));
    setCompletedModules(new Set());
  }, [courseSlug]);

  const completionCount = completedModules.size;
  const percent = totalModules ? (completionCount / totalModules) * 100 : 0;

  return {
    completedModules,
    markModuleComplete,
    markModuleIncomplete,
    clearProgress,
    completionCount,
    percent
  };
}
