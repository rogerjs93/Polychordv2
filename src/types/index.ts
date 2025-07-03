export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  learned: boolean;
  attempts: number;
  correctAttempts: number;
}

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  totalLessonsCompleted: number;
  lastLoginDate: string;
  dailyGoal: number;
  wordsLearnedToday: number;
  achievements: Achievement[];
  weeklyProgress: DailyProgress[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface DailyProgress {
  date: string;
  wordsLearned: number;
  lessonsCompleted: number;
  timeSpent: number;
}

export interface LanguagePair {
  id: string;
  nativeLanguage: string;
  targetLanguage: string;
  addedDate: string;
  progress: {
    wordsLearned: number;
    lessonsCompleted: number;
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  progress: UserProgress;
  languagePairs: LanguagePair[];
  currentLanguagePair?: string; // ID of currently selected language pair
  preferences: {
    dailyReminder: boolean;
    soundEnabled: boolean;
    theme: 'light' | 'dark';
  };
}

export interface GameScore {
  gameType: 'matching' | 'memory' | 'typing' | 'listening' | 'puzzle' | 'quiz';
  score: number;
  accuracy: number;
  timeSpent: number;
  date: string;
  languagePair: string;
}

export interface LessonSection {
  id: number;
  words: VocabularyItem[];
  completed: boolean;
  wordsLearned: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  sections: LessonSection[];
  totalWords: number;
  completed: boolean;
  languagePair: string;
}