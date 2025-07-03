import { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface UseVocabularyReturn {
  vocabulary: VocabularyItem[];
  loading: boolean;
  error: string | null;
  refreshVocabulary: () => void;
  getVocabularyByCategory: (category: string) => VocabularyItem[];
  getVocabularyByDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') => VocabularyItem[];
  getAllCategories: () => string[];
  getCurrentLessonWords: (currentLessonIndex: number, currentSectionIndex: number) => VocabularyItem[];
  getWordsForGames: (gameType: string, currentLessonIndex?: number, currentSectionIndex?: number) => VocabularyItem[];
}

interface WordData {
  word: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  semantic_category?: string;
}

type LanguageData = Record<string, WordData>;

export const useVocabulary = (nativeLanguage: string, targetLanguage: string): UseVocabularyReturn => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateVocabularyFromLanguageFiles = async (nativeLang: string, targetLang: string): Promise<VocabularyItem[]> => {
    try {
      console.log(`Loading vocabulary for ${nativeLang} → ${targetLang}`);
      
      // Dynamically import the language files
      const [nativeData, targetData] = await Promise.all([
        import(`../data/${nativeLang}.json`).then(module => module.default as LanguageData),
        import(`../data/${targetLang}.json`).then(module => module.default as LanguageData)
      ]);

      const vocabulary: VocabularyItem[] = [];
      
      // Get all available word numbers (keys) from both dictionaries
      const nativeKeys = Object.keys(nativeData);
      const targetKeys = Object.keys(targetData);
      
      // Find common word numbers between both languages
      const commonKeys = nativeKeys.filter(key => targetKeys.includes(key));
      
      console.log(`Found ${commonKeys.length} common words between ${nativeLang} and ${targetLang}`);
      
      // Limit to a reasonable number for learning (first 1000 common words)
      const limitedKeys = commonKeys.slice(0, 1000);
      
      // Generate vocabulary items for each common word
      limitedKeys.forEach(wordNumber => {
        const nativeWord = nativeData[wordNumber];
        const targetWord = targetData[wordNumber];
        
        if (nativeWord && targetWord) {
          vocabulary.push({
            id: `${nativeLang}-${targetLang}-${wordNumber}`,
            word: targetWord.word, // Target language word (word to learn)
            translation: nativeWord.word, // Native language translation
            pronunciation: '', // Will add pronunciation later if available
            example: `Example with ${targetWord.word}`, // Simple example
            exampleTranslation: `Ejemplo con ${nativeWord.word}`, // Example translation
            difficulty: targetWord.difficulty || 'beginner',
            category: targetWord.category || 'general',
            learned: false,
            attempts: 0,
            correctAttempts: 0
          });
        }
      });

      // Sort vocabulary by difficulty first, then by category for better organization
      vocabulary.sort((a, b) => {
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        const difficultyDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        
        if (difficultyDiff !== 0) {
          return difficultyDiff;
        }
        
        if (a.category === b.category) {
          return a.word.localeCompare(b.word);
        }
        return a.category.localeCompare(b.category);
      });

      return vocabulary;
    } catch (error) {
      console.error(`Error loading vocabulary files for ${nativeLang}→${targetLang}:`, error);
      throw error;
    }
  };
    
    console.log(`Found ${commonKeys.length} common words between ${nativeLang} and ${targetLang}`);
    
    // Generate vocabulary items for each common word
    commonKeys.forEach(wordNumber => {
      const nativeWord = nativeDict[wordNumber];
      const targetWord = targetDict[wordNumber];
      
      if (nativeWord && targetWord) {
        vocabulary.push({
          id: `${nativeLang}-${targetLang}-${wordNumber}`,
          word: nativeWord.word,
          translation: targetWord.word,
          pronunciation: targetWord.pronunciation,
          example: nativeWord.example,
          exampleTranslation: targetWord.example,
          difficulty: targetWord.difficulty || 'beginner',
          category: nativeWord.category,
          learned: false,
          attempts: 0,
          correctAttempts: 0
        });
      }
    });

    // Sort vocabulary by difficulty first, then by category for better organization
    vocabulary.sort((a, b) => {
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const difficultyDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      
      if (difficultyDiff !== 0) {
        return difficultyDiff;
      }
      
      if (a.category === b.category) {
        return a.word.localeCompare(b.word);
      }
      return a.category.localeCompare(b.category);
    });

    return vocabulary;
  };

  const loadVocabulary = () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Generating vocabulary for ${nativeLanguage} → ${targetLanguage}`);
      
      const generatedVocabulary = generateVocabularyFromDictionaries(nativeLanguage, targetLanguage);
      
      if (generatedVocabulary.length > 0) {
        console.log(`Successfully generated ${generatedVocabulary.length} vocabulary items`);
        setVocabulary(generatedVocabulary);
        setError(null);
      } else {
        // Try to find alternative combinations
        const dictionaries = wordDictionaries as WordDictionaries;
        const availableLanguages = Object.keys(dictionaries);
        
        console.log('Available languages:', availableLanguages);
        
        // Check if we have at least one of the requested languages
        if (availableLanguages.includes(nativeLanguage)) {
          // Try with English as target if available
          if (availableLanguages.includes('en') && targetLanguage !== 'en') {
            const fallbackVocab = generateVocabularyFromDictionaries(nativeLanguage, 'en');
            if (fallbackVocab.length > 0) {
              setVocabulary(fallbackVocab);
              setError(`No direct vocabulary for ${nativeLanguage}→${targetLanguage}. Showing ${nativeLanguage}→English instead.`);
              return;
            }
          }
        } else if (availableLanguages.includes(targetLanguage)) {
          // Try with English as native if available
          if (availableLanguages.includes('en') && nativeLanguage !== 'en') {
            const fallbackVocab = generateVocabularyFromDictionaries('en', targetLanguage);
            if (fallbackVocab.length > 0) {
              setVocabulary(fallbackVocab);
              setError(`No direct vocabulary for ${nativeLanguage}→${targetLanguage}. Showing English→${targetLanguage} instead.`);
              return;
            }
          }
        }
        
        // Final fallback to English-Spanish
        const finalFallback = generateVocabularyFromDictionaries('en', 'es');
        if (finalFallback.length > 0) {
          setVocabulary(finalFallback);
          setError(`No vocabulary available for ${nativeLanguage}→${targetLanguage}. Showing English→Spanish as fallback.`);
        } else {
          setVocabulary([]);
          setError(`No vocabulary available for any language combination. Please check the word dictionaries.`);
        }
      }
    } catch (err) {
      console.error('Error generating vocabulary:', err);
      setError('Failed to load vocabulary');
      setVocabulary([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nativeLanguage && targetLanguage) {
      loadVocabulary();
    }
  }, [nativeLanguage, targetLanguage]);

  const getVocabularyByCategory = (category: string): VocabularyItem[] => {
    return vocabulary.filter(item => item.category === category);
  };

  const getVocabularyByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): VocabularyItem[] => {
    return vocabulary.filter(item => item.difficulty === difficulty);
  };

  const getAllCategories = (): string[] => {
    const categories = [...new Set(vocabulary.map(item => item.category))];
    return categories.sort();
  };

  const getCurrentLessonWords = (currentLessonIndex: number, currentSectionIndex: number): VocabularyItem[] => {
    const wordsPerSection = 10;
    const startIndex = currentSectionIndex * wordsPerSection;
    const endIndex = startIndex + wordsPerSection;
    
    return vocabulary.slice(startIndex, endIndex);
  };

  const getWordsForGames = (
    gameType: string, 
    currentLessonIndex?: number, 
    currentSectionIndex?: number
  ): VocabularyItem[] => {
    // If lesson/section context is provided, use words from current and previous sections
    if (typeof currentLessonIndex === 'number' && typeof currentSectionIndex === 'number') {
      const wordsPerSection = 10;
      const sectionsPerLesson = 3;
      
      // Calculate total sections completed up to current position
      const totalSectionsCompleted = (currentLessonIndex * sectionsPerLesson) + currentSectionIndex;
      
      // Get words from current section and a few previous sections for variety
      const sectionsToInclude = Math.min(3, totalSectionsCompleted + 1); // Include current + up to 2 previous
      const startSectionIndex = Math.max(0, totalSectionsCompleted - sectionsToInclude + 1);
      const endSectionIndex = totalSectionsCompleted + 1;
      
      const startWordIndex = startSectionIndex * wordsPerSection;
      const endWordIndex = endSectionIndex * wordsPerSection;
      
      const contextualWords = vocabulary.slice(startWordIndex, endWordIndex);
      
      // Determine how many words each game type needs
      const gameWordCounts = {
        'matching': 5,
        'memory': 4,
        'typing': 5,
        'listening': 4,
        'puzzle': 3,
        'quiz': 5
      };
      
      const wordsNeeded = gameWordCounts[gameType as keyof typeof gameWordCounts] || 5;
      
      // If we have enough contextual words, use them; otherwise supplement with beginner words
      if (contextualWords.length >= wordsNeeded) {
        // Shuffle and take the needed amount
        const shuffled = [...contextualWords].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, wordsNeeded);
      } else {
        // Supplement with beginner words from the same categories
        const categories = [...new Set(contextualWords.map(w => w.category))];
        const beginnerWords = vocabulary.filter(w => 
          w.difficulty === 'beginner' && 
          categories.includes(w.category) &&
          !contextualWords.some(cw => cw.id === w.id)
        );
        
        const combinedWords = [...contextualWords, ...beginnerWords];
        const shuffled = combinedWords.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, wordsNeeded);
      }
    }
    
    // Fallback: use difficulty-appropriate words
    const gameWordCounts = {
      'matching': 5,
      'memory': 4,
      'typing': 5,
      'listening': 4,
      'puzzle': 3,
      'quiz': 5
    };
    
    const wordsNeeded = gameWordCounts[gameType as keyof typeof gameWordCounts] || 5;
    
    // Prefer beginner words for games to ensure accessibility
    const beginnerWords = getVocabularyByDifficulty('beginner');
    const availableWords = beginnerWords.length >= wordsNeeded ? beginnerWords : vocabulary;
    
    // Shuffle and return the needed amount
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, wordsNeeded);
  };

  const refreshVocabulary = () => {
    loadVocabulary();
  };

  return {
    vocabulary,
    loading,
    error,
    refreshVocabulary,
    getVocabularyByCategory,
    getVocabularyByDifficulty,
    getAllCategories,
    getCurrentLessonWords,
    getWordsForGames
  };
};