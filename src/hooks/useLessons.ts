import { useMemo } from 'react';
import { VocabularyItem, Lesson, LessonSection } from '../types';

/**
 * Hook to generate lessons from vocabulary data.
 * 
 * Lesson Structure:
 * - All lessons and sections are unlocked by default
 * - Users can access any lesson/section regardless of completion status
 * - The "Continue Learning" feature guides users to their next uncompleted lesson
 * - No prerequisite system - full freedom of choice for learners
 */
export const useLessons = (vocabulary: VocabularyItem[], completedSections: string[]) => {
  const { lessons, categories, firstUncompletedLessonIndex } = useMemo(() => {
    const wordsPerSection = 10;
    const sectionsPerLesson = 3;

    const wordsByCategory = vocabulary.reduce((acc, word) => {
      if (!acc[word.category]) {
        acc[word.category] = [];
      }
      acc[word.category].push(word);
      return acc;
    }, {} as Record<string, VocabularyItem[]>);

    const allCategories = Object.keys(wordsByCategory);
    const generatedLessons: Lesson[] = [];

    allCategories.forEach((category) => {
      const categoryWords = wordsByCategory[category];
      
      const beginnerWords = categoryWords.filter(w => w.difficulty === 'beginner');
      const intermediateWords = categoryWords.filter(w => w.difficulty === 'intermediate');
      const advancedWords = categoryWords.filter(w => w.difficulty === 'advanced');
      
      [
        { words: beginnerWords, difficulty: 'beginner' as const },
        { words: intermediateWords, difficulty: 'intermediate' as const },
        { words: advancedWords, difficulty: 'advanced' as const }
      ].forEach(({ words, difficulty }) => {
        if (words.length === 0) return;
        
        const totalSections = Math.ceil(words.length / wordsPerSection);
        const totalLessons = Math.ceil(totalSections / sectionsPerLesson);

        for (let lessonIndex = 0; lessonIndex < totalLessons; lessonIndex++) {
          const lessonSections: LessonSection[] = [];
          const startSectionIndex = lessonIndex * sectionsPerLesson;
          const endSectionIndex = Math.min(startSectionIndex + sectionsPerLesson, totalSections);

          for (let sectionIndex = startSectionIndex; sectionIndex < endSectionIndex; sectionIndex++) {
            const startWordIndex = sectionIndex * wordsPerSection;
            const endWordIndex = Math.min(startWordIndex + wordsPerSection, words.length);
            const sectionWords = words.slice(startWordIndex, endWordIndex);

            if (sectionWords.length > 0) {
              const sectionId = `${category}-${difficulty}-section-${sectionIndex}`;
              lessonSections.push({
                id: sectionId,
                title: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - Section ${sectionIndex + 1}`,
                words: sectionWords,
                completed: completedSections.includes(sectionId),
                category,
                difficulty,
                isLocked: false // All sections are unlocked by default - users can access any lesson/section
              });
            }
          }

          if (lessonSections.length > 0) {
            const lessonId = `${category}-${difficulty}-lesson-${lessonIndex}`;
            const totalWords = lessonSections.reduce((sum, section) => sum + section.words.length, 0);
            
            const sectionsWithCompletion = lessonSections.map(section => ({ 
              ...section, 
              completed: completedSections.includes(section.id) 
            }));
            
            const isLessonCompleted = sectionsWithCompletion.every(s => s.completed);

            generatedLessons.push({
              id: lessonId,
              title: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - Lesson ${lessonIndex + 1}`,
              description: `Learn ${totalWords} ${difficulty} words about ${category}`,
              sections: sectionsWithCompletion,
              totalWords,
              completed: isLessonCompleted,
              category,
              difficulty,
              isLocked: false // All lessons are unlocked by default - users can access any lesson
            });
          }
        }
      });
    });

    generatedLessons.sort((a, b) => {
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const difficultyDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      
      if (difficultyDiff !== 0) {
        return difficultyDiff;
      }
      
      return a.category.localeCompare(b.category);
    });

    const firstUncompletedLessonIndex = generatedLessons.findIndex(lesson => !lesson.completed);

    return { lessons: generatedLessons, categories: allCategories, firstUncompletedLessonIndex };
  }, [vocabulary, completedSections]);

  return { lessons, categories, firstUncompletedLessonIndex };
};
