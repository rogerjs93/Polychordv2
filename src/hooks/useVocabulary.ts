import { useState, useEffect, useCallback } from 'react';
import { VocabularyItem } from '../types';

// Import all language data files
import enData from '../data/en.json';
import esData from '../data/es.json';
import frData from '../data/fr.json';
import deData from '../data/de.json';
import itData from '../data/it.json';
import ptData from '../data/pt.json';
import nlData from '../data/nl.json';
import ruData from '../data/ru.json';
import jaData from '../data/ja.json';
import koData from '../data/ko.json';
import zhData from '../data/zh.json';
import svData from '../data/sv.json';
import noData from '../data/no.json';
import daData from '../data/da.json';
import fiData from '../data/fi.json';
import ukData from '../data/uk.json';

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
  difficulty: string; // Changed from strict union to string to match JSON data
  semantic_category?: string;
}

type LanguageData = Record<string, WordData>;

// Language data mapping
const languageDataMap: Record<string, LanguageData> = {
  'en': enData,
  'es': esData,
  'fr': frData,
  'de': deData,
  'it': itData,
  'pt': ptData,
  'nl': nlData,
  'ru': ruData,
  'ja': jaData,
  'ko': koData,
  'zh': zhData,
  'sv': svData,
  'no': noData,
  'da': daData,
  'fi': fiData,
  'uk': ukData
};

export const useVocabulary = (nativeLanguage: string, targetLanguage: string): UseVocabularyReturn => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateVocabularyFromLanguageFiles = useCallback((nativeLang: string, targetLang: string): VocabularyItem[] => {
    try {
      console.log(`Loading vocabulary for ${nativeLang} → ${targetLang}`);
      
      // Get the language data from our imported files
      const nativeData = languageDataMap[nativeLang];
      const targetData = languageDataMap[targetLang];

      if (!nativeData) {
        console.warn(`No data found for native language: ${nativeLang}`);
        return [];
      }
      
      if (!targetData) {
        console.warn(`No data found for target language: ${targetLang}`);
        return [];
      }

      const vocabulary: VocabularyItem[] = [];
      
      // Get all available word numbers (keys) from both dictionaries
      const nativeKeys = Object.keys(nativeData);
      const targetKeys = Object.keys(targetData);
      
      // Find common word numbers between both languages
      const commonKeys = nativeKeys.filter(key => targetKeys.includes(key));
      
      console.log(`Found ${commonKeys.length} common words between ${nativeLang} and ${targetLang}`);
      
      if (commonKeys.length === 0) {
        console.warn(`No common words found between ${nativeLang} and ${targetLang}`);
        return [];
      }
      
      // Limit to a reasonable number for learning (first 1000 common words)
      const limitedKeys = commonKeys.slice(0, 1000);
      
      // Generate vocabulary items for each common word
      limitedKeys.forEach(wordNumber => {
        const nativeWord = nativeData[wordNumber];
        const targetWord = targetData[wordNumber];
        
        if (nativeWord && targetWord && nativeWord.word && targetWord.word) {
          // Validate difficulty value to match the expected union type
          const validDifficulty = ['beginner', 'intermediate', 'advanced'].includes(targetWord.difficulty) 
            ? targetWord.difficulty as 'beginner' | 'intermediate' | 'advanced'
            : 'beginner';
          
          vocabulary.push({
            id: `${nativeLang}-${targetLang}-${wordNumber}`,
            word: targetWord.word, // Target language word (word to learn)
            translation: nativeWord.word, // Native language translation
            pronunciation: '', // Will add pronunciation later if available
            example: `Example with ${targetWord.word}`, // Simple example
            exampleTranslation: `Ejemplo con ${nativeWord.word}`, // Example translation
            difficulty: validDifficulty,
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

      console.log(`Successfully generated ${vocabulary.length} vocabulary items`);
      return vocabulary;
    } catch (error) {
      console.error(`Error loading vocabulary files for ${nativeLang}→${targetLang}:`, error);
      return [];
    }
  }, []);

  const loadVocabulary = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Loading vocabulary for ${nativeLanguage} → ${targetLanguage}`);
      
      const generatedVocabulary = generateVocabularyFromLanguageFiles(nativeLanguage, targetLanguage);
      
      if (generatedVocabulary.length > 0) {
        console.log(`✅ Successfully loaded ${generatedVocabulary.length} vocabulary items`);
        setVocabulary(generatedVocabulary);
        setError(null);
      } else {
        // Try fallback combinations
        try {
          console.log(`❌ No vocabulary found, trying fallback: ${nativeLanguage} → en`);
          const fallbackVocab = generateVocabularyFromLanguageFiles(nativeLanguage, 'en');
          if (fallbackVocab.length > 0) {
            setVocabulary(fallbackVocab);
            setError(`No direct vocabulary for ${nativeLanguage}→${targetLanguage}. Showing ${nativeLanguage}→English instead.`);
            return;
          }
        } catch {
          console.log('Fallback to English failed, trying final fallback');
        }
        
        // Final fallback to English-Spanish
        try {
          const finalFallback = generateVocabularyFromLanguageFiles('en', 'es');
          if (finalFallback.length > 0) {
            setVocabulary(finalFallback);
            setError(`No vocabulary available for ${nativeLanguage}→${targetLanguage}. Showing English→Spanish as fallback.`);
          } else {
            setVocabulary([]);
            setError(`No vocabulary available for any language combination.`);
          }
        } catch {
          setVocabulary([]);
          setError(`Failed to load vocabulary data. Please check the language files.`);
        }
      }
    } catch (err) {
      console.error('Error loading vocabulary:', err);
      setError(`Failed to load vocabulary for ${nativeLanguage}→${targetLanguage}. The language combination may not be available.`);
      setVocabulary([]);
    } finally {
      setLoading(false);
    }
  }, [nativeLanguage, targetLanguage, generateVocabularyFromLanguageFiles]);

  useEffect(() => {
    if (nativeLanguage && targetLanguage) {
      loadVocabulary();
    }
  }, [loadVocabulary, nativeLanguage, targetLanguage]);

  const refreshVocabulary = useCallback(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  const getVocabularyByCategory = useCallback((category: string): VocabularyItem[] => {
    return vocabulary.filter(item => item.category.toLowerCase() === category.toLowerCase());
  }, [vocabulary]);

  const getVocabularyByDifficulty = useCallback((difficulty: 'beginner' | 'intermediate' | 'advanced'): VocabularyItem[] => {
    return vocabulary.filter(item => item.difficulty === difficulty);
  }, [vocabulary]);

  const getAllCategories = useCallback((): string[] => {
    const categories = vocabulary.map(item => item.category);
    return [...new Set(categories)].sort();
  }, [vocabulary]);

  const getCurrentLessonWords = useCallback((currentLessonIndex: number, currentSectionIndex: number): VocabularyItem[] => {
    const wordsPerSection = 10;
    const startIndex = (currentLessonIndex * 50) + (currentSectionIndex * wordsPerSection);
    const endIndex = startIndex + wordsPerSection;
    
    return vocabulary.slice(startIndex, endIndex);
  }, [vocabulary]);

  const getWordsForGames = useCallback((_gameType: string, currentLessonIndex?: number, currentSectionIndex?: number): VocabularyItem[] => {
    if (currentLessonIndex !== undefined && currentSectionIndex !== undefined) {
      return getCurrentLessonWords(currentLessonIndex, currentSectionIndex);
    }
    
    // For games, return a random selection of words based on difficulty
    const beginnerWords = getVocabularyByDifficulty('beginner').slice(0, 20);
    const intermediateWords = getVocabularyByDifficulty('intermediate').slice(0, 10);
    
    return [...beginnerWords, ...intermediateWords].sort(() => Math.random() - 0.5);
  }, [getCurrentLessonWords, getVocabularyByDifficulty]);

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
