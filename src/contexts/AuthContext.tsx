import React, { createContext, useEffect, useRef } from 'react';
import { User, UserProgress, LanguagePair } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AuthContextType {
  user: User | null;
  createUser: (name: string, nativeLanguage: string, targetLanguage: string) => void;
  resetUser: () => void;
  updateProgress: (progress: Partial<UserProgress>) => void;
  updateDailyProgress: () => void;
  addLanguagePair: (nativeLanguage: string, targetLanguage: string) => void;
  removeLanguagePair: (pairId: string) => void;
  setCurrentLanguagePair: (pairId: string) => void;
  getCurrentLanguagePair: () => LanguagePair | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('polychord_user', null);
  const initializedRef = useRef(false);

  const createInitialProgress = (): UserProgress => ({
    currentStreak: 0,
    longestStreak: 0,
    totalWordsLearned: 0,
    totalLessonsCompleted: 0,
    completedLessons: [],
    completedSections: [],
    lastLoginDate: new Date().toISOString().split('T')[0],
    dailyGoal: 10,
    wordsLearnedToday: 0,
    achievements: [],
    weeklyProgress: []
  });

  const createLanguagePair = (nativeLanguage: string, targetLanguage: string): LanguagePair => ({
    id: `${nativeLanguage}-${targetLanguage}-${Date.now()}`,
    nativeLanguage,
    targetLanguage,
    addedDate: new Date().toISOString(),
    progress: {
      wordsLearned: 0,
      lessonsCompleted: 0,
      currentLevel: 'beginner'
    }
  });

  // Check if user exists and update daily progress on mount
  useEffect(() => {
    if (!initializedRef.current && user) {
      initializedRef.current = true;
      
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = new Date(user.progress.lastLoginDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      const updatedProgress = { ...user.progress };
      
      if (daysDiff === 1) {
        // Consecutive day - increment streak
        updatedProgress.currentStreak += 1;
        updatedProgress.longestStreak = Math.max(updatedProgress.longestStreak, updatedProgress.currentStreak);
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        updatedProgress.currentStreak = 1;
      }
      
      updatedProgress.lastLoginDate = today;
      if (daysDiff > 0) {
        updatedProgress.wordsLearnedToday = 0; // Reset daily count if new day
      }

      // Migrate user to new structure if needed
      let updatedUser = { ...user, progress: updatedProgress };
      if (!updatedUser.languagePairs) {
        const initialPair = createLanguagePair(updatedUser.nativeLanguage, updatedUser.targetLanguage);
        updatedUser = {
          ...updatedUser,
          languagePairs: [initialPair],
          currentLanguagePair: initialPair.id
        };
      }

      if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
        setUser(updatedUser);
      }
    }
  }, [user, setUser]); // Run when user changes or on mount

  const createUser = (name: string, nativeLanguage: string, targetLanguage: string) => {
    const initialPair = createLanguagePair(nativeLanguage, targetLanguage);
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: '', // Not needed for local storage
      nativeLanguage,
      targetLanguage,
      level: 'beginner',
      progress: createInitialProgress(),
      languagePairs: [initialPair],
      currentLanguagePair: initialPair.id,
      preferences: {
        dailyReminder: true,
        soundEnabled: true,
        theme: 'light'
      }
    };

    setUser(newUser);
  };

  const resetUser = () => {
    setUser(null);
  };

  const updateProgress = (progressUpdate: Partial<UserProgress>) => {
    if (user) {
      const updatedUser = {
        ...user,
        progress: {
          ...user.progress,
          ...progressUpdate
        }
      };
      setUser(updatedUser);
    }
  };

  const updateDailyProgress = () => {
    if (user) {
      const updatedProgress = {
        ...user.progress,
        wordsLearnedToday: user.progress.wordsLearnedToday + 1,
        totalWordsLearned: user.progress.totalWordsLearned + 1
      };

      // Also update current language pair progress
      const currentPair = getCurrentLanguagePair();
      let updatedUser = {
        ...user,
        progress: updatedProgress
      };

      if (currentPair) {
        const updatedPairs = user.languagePairs.map(pair => 
          pair.id === currentPair.id 
            ? { ...pair, progress: { ...pair.progress, wordsLearned: pair.progress.wordsLearned + 1 } }
            : pair
        );
        updatedUser = {
          ...updatedUser,
          languagePairs: updatedPairs
        };
      }

      setUser(updatedUser);
    }
  };

  const addLanguagePair = (nativeLanguage: string, targetLanguage: string) => {
    if (user) {
      const newPair = createLanguagePair(nativeLanguage, targetLanguage);
      const updatedUser = {
        ...user,
        languagePairs: [...user.languagePairs, newPair]
      };
      setUser(updatedUser);
    }
  };

  const removeLanguagePair = (pairId: string) => {
    if (user && user.languagePairs.length > 1) {
      const updatedPairs = user.languagePairs.filter(pair => pair.id !== pairId);
      const updatedUser = {
        ...user,
        languagePairs: updatedPairs,
        currentLanguagePair: user.currentLanguagePair === pairId ? updatedPairs[0].id : user.currentLanguagePair
      };
      setUser(updatedUser);
    }
  };

  const setCurrentLanguagePair = (pairId: string) => {
    if (user) {
      setUser({
        ...user,
        currentLanguagePair: pairId
      });
    }
  };

  const getCurrentLanguagePair = (): LanguagePair | null => {
    if (!user || !user.languagePairs || user.languagePairs.length === 0) return null;
    return user.languagePairs.find(pair => pair.id === user.currentLanguagePair) || user.languagePairs[0] || null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      createUser,
      resetUser,
      updateProgress,
      updateDailyProgress,
      addLanguagePair,
      removeLanguagePair,
      setCurrentLanguagePair,
      getCurrentLanguagePair
    }}>
      {children}
    </AuthContext.Provider>
  );
};
