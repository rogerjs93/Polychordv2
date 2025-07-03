import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export const useProgress = () => {
  const { user, updateProgress } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    if (user?.progress) {
      setCompletedLessons(user.progress.completedLessons || []);
      setCompletedSections(user.progress.completedSections || []);
    }
  }, [user]);

  const completeLesson = useCallback((lessonId: string) => {
    if (user) {
      const newCompleted = Array.from(new Set([...(user.progress.completedLessons || []), lessonId]));
      updateProgress({ completedLessons: newCompleted });
    }
  }, [user, updateProgress]);

  const completeSection = useCallback((sectionId: string) => {
    if (user) {
      const newCompleted = Array.from(new Set([...(user.progress.completedSections || []), sectionId]));
      updateProgress({ completedSections: newCompleted });
    }
  }, [user, updateProgress]);

  return {
    completedLessons,
    completedSections,
    completeLesson,
    completeSection,
  };
};
