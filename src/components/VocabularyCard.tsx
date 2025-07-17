import React, { useState } from 'react';
import { Volume2, RotateCcw, Check, X, Mic, Star, AlertCircle } from 'lucide-react';
import { VocabularyItem } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { useTranslation } from '../hooks/useTranslation';
import { getLanguageCodeForSpeech } from '../utils/languageDetection';

interface VocabularyCardProps {
  item: VocabularyItem;
  onAnswer: (correct: boolean) => void;
  targetLanguage: string;
  nativeLanguage?: string;
}

interface PronunciationResult {
  score: number;
  feedback: string;
  accuracy: 'excellent' | 'good' | 'fair' | 'poor';
  spokenText: string;
  targetText: string;
  details: {
    exactMatch: boolean;
    similarity: number;
    wordMatch: number;
    lengthRatio: number;
  };
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  onAnswer,
  targetLanguage,
  nativeLanguage = 'en'
}) => {
  const [flipped, setFlipped] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [showPronunciationFeedback, setShowPronunciationFeedback] = useState(false);
  
  // Only load voices for the languages used in this component
  const languageCodes = [targetLanguage, nativeLanguage];
  const { speak, startListening, isSpeaking, isListening } = useSpeech({ languageCodes });
  const { t } = useTranslation();

  const handleSpeak = (text: string, isTargetLanguage: boolean = true) => {
    const langCode = isTargetLanguage 
      ? getLanguageCodeForSpeech(targetLanguage)
      : getLanguageCodeForSpeech(nativeLanguage);
    speak(text, langCode);
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/ç/g, 'c')
      .replace(/[äöü]/g, (match) => ({ 'ä': 'a', 'ö': 'o', 'ü': 'u' }[match] || match));
  };

  const calculateLevenshteinDistance = (str1: string, str2: string): number => {
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;
    
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = calculateLevenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  };

  const calculateWordSimilarity = (spoken: string, target: string): number => {
    const spokenWords = spoken.split(' ').filter(w => w.length > 0);
    const targetWords = target.split(' ').filter(w => w.length > 0);
    
    if (spokenWords.length === 0 && targetWords.length === 0) return 1;
    if (spokenWords.length === 0 || targetWords.length === 0) return 0;
    
    let totalSimilarity = 0;
    let comparisons = 0;
    
    // Compare each spoken word with each target word
    for (const spokenWord of spokenWords) {
      let bestMatch = 0;
      for (const targetWord of targetWords) {
        const similarity = calculateSimilarity(spokenWord, targetWord);
        bestMatch = Math.max(bestMatch, similarity);
      }
      totalSimilarity += bestMatch;
      comparisons++;
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  };

  const calculatePronunciationScore = (spoken: string, target: string): PronunciationResult => {
    const spokenNormalized = normalizeText(spoken);
    const targetNormalized = normalizeText(target);
    
    console.log('=== Pronunciation Analysis ===');
    console.log('Original spoken:', spoken);
    console.log('Original target:', target);
    console.log('Normalized spoken:', spokenNormalized);
    console.log('Normalized target:', targetNormalized);
    
    // Check for exact match
    const exactMatch = spokenNormalized === targetNormalized;
    
    // Calculate various similarity metrics
    const overallSimilarity = calculateSimilarity(spokenNormalized, targetNormalized);
    const wordSimilarity = calculateWordSimilarity(spokenNormalized, targetNormalized);
    const lengthRatio = Math.min(spokenNormalized.length, targetNormalized.length) / 
                       Math.max(spokenNormalized.length, targetNormalized.length);
    
    // Check if spoken text contains target or vice versa
    const containsTarget = spokenNormalized.includes(targetNormalized) || 
                          targetNormalized.includes(spokenNormalized);
    
    console.log('Exact match:', exactMatch);
    console.log('Overall similarity:', overallSimilarity);
    console.log('Word similarity:', wordSimilarity);
    console.log('Length ratio:', lengthRatio);
    console.log('Contains target:', containsTarget);
    
    // Calculate final score with weighted components
    let score = 0;
    
    if (exactMatch) {
      score = 100;
    } else if (containsTarget && overallSimilarity > 0.8) {
      score = 90 + (overallSimilarity * 10);
    } else {
      // Weighted scoring system
      const similarityWeight = 0.4;
      const wordWeight = 0.4;
      const lengthWeight = 0.2;
      
      score = (overallSimilarity * similarityWeight + 
               wordSimilarity * wordWeight + 
               lengthRatio * lengthWeight) * 100;
      
      // Bonus for partial matches
      if (containsTarget) {
        score += 15;
      }
      
      // Penalty for very different lengths
      if (lengthRatio < 0.5) {
        score *= 0.8;
      }
      
      // Ensure minimum score for any attempt
      if (spokenNormalized.length > 0 && score < 20) {
        score = 20;
      }
    }
    
    // Cap the score at 100
    score = Math.min(Math.round(score), 100);
    
    console.log('Final score:', score);
    
    let feedback = '';
    let accuracy: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (score >= 90) {
      accuracy = 'excellent';
      feedback = 'Perfect! Your pronunciation is excellent!';
    } else if (score >= 75) {
      accuracy = 'good';
      feedback = 'Great job! Your pronunciation is very good.';
    } else if (score >= 50) {
      accuracy = 'fair';
      feedback = 'Good effort! Keep practicing to improve your pronunciation.';
    } else {
      accuracy = 'poor';
      feedback = 'Keep trying! Listen carefully and practice the pronunciation.';
    }
    
    return { 
      score, 
      feedback, 
      accuracy, 
      spokenText: spoken,
      targetText: target,
      details: {
        exactMatch,
        similarity: Math.round(overallSimilarity * 100),
        wordMatch: Math.round(wordSimilarity * 100),
        lengthRatio: Math.round(lengthRatio * 100)
      }
    };
  };

  const handleListen = async () => {
    try {
      setPronunciationResult(null);
      setShowPronunciationFeedback(false);
      
      const langCode = getLanguageCodeForSpeech(targetLanguage);
      
      const result = await startListening(langCode);
      const targetWord = flipped ? item.translation : item.word;
      
      console.log('Speech result:', result);
      console.log('Target word:', targetWord);
      
      const pronunciationScore = calculatePronunciationScore(result, targetWord);
      
      setPronunciationResult(pronunciationScore);
      setShowPronunciationFeedback(true);
      
      // Auto-advance if pronunciation is good enough
      if (pronunciationScore.score >= 75) {
        setTimeout(() => {
          onAnswer(true);
          setShowPronunciationFeedback(false);
          setPronunciationResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setPronunciationResult({
        score: 0,
        feedback: `Speech recognition error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        accuracy: 'poor',
        spokenText: '',
        targetText: flipped ? item.translation : item.word,
        details: {
          exactMatch: false,
          similarity: 0,
          wordMatch: 0,
          lengthRatio: 0
        }
      });
      setShowPronunciationFeedback(true);
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStarRating = (score: number) => {
    const stars = Math.ceil(score / 20); // Convert to 1-5 star rating
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 mb-4">
          <h3 className="text-2xl font-bold mb-2">
            {flipped ? item.translation : item.word}
          </h3>
          <p className="text-sm opacity-90">
            {flipped ? item.pronunciation : t('clickToReveal')}
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => handleSpeak(flipped ? item.translation : item.word, !flipped)}
            disabled={isSpeaking}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            {isSpeaking ? t('playing_') : t('listen')}
          </button>
          
          <button
            onClick={() => setFlipped(!flipped)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('flip')}
          </button>
          
          <button
            onClick={handleListen}
            disabled={isListening}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            {isListening ? t('listening') : t('practice')}
          </button>
        </div>
      </div>

      {/* Pronunciation Feedback */}
      {showPronunciationFeedback && pronunciationResult && (
        <div className={`rounded-lg p-4 mb-4 border-2 ${getAccuracyColor(pronunciationResult.accuracy)}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">{t('pronunciationFeedback')}</h4>
            <div className="flex items-center gap-1">
              {getStarRating(pronunciationResult.score)}
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{t('score')}:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-bold ${getAccuracyColor(pronunciationResult.accuracy)}`}>
                {pronunciationResult.score}%
              </span>
            </div>
            
            {pronunciationResult.spokenText && (
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <div><span className="font-medium">{t('youSaid')}:</span> "{pronunciationResult.spokenText}"</div>
                <div><span className="font-medium">{t('target')}:</span> "{pronunciationResult.targetText}"</div>
                <div className="text-xs text-gray-500 mt-2">
                  <div>{t('similarity')}: {pronunciationResult.details.similarity}%</div>
                  <div>{t('wordMatch')}: {pronunciationResult.details.wordMatch}%</div>
                  <div>{t('lengthMatch')}: {pronunciationResult.details.lengthRatio}%</div>
                  {pronunciationResult.details.exactMatch && <div className="text-green-600 font-medium">✓ {t('exactMatch')}</div>}
                </div>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{pronunciationResult.feedback}</p>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPronunciationFeedback(false);
                setPronunciationResult(null);
              }}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {t('tryAgain')}
            </button>
            {pronunciationResult.score >= 40 && (
              <button
                onClick={() => {
                  onAnswer(pronunciationResult.score >= 60);
                  setShowPronunciationFeedback(false);
                  setPronunciationResult(null);
                }}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                {t('continue')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Learning Progress Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{t('learningProgress')}</span>
          <span className="text-sm text-gray-500">
            {item.correctAttempts}/{Math.max(3, item.attempts)} {t('correct')}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((item.correctAttempts / 3) * 100, 100)}%` }}
          ></div>
        </div>
        {item.learned && (
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">{t('mastered')}</span>
          </div>
        )}
      </div>

      {showExample && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t('exampleUsage')}</span>
          </div>
          <p className="text-gray-800 mb-2">{item.example}</p>
          <p className="text-gray-600 text-sm italic">{item.exampleTranslation}</p>
          <button
            onClick={() => handleSpeak(item.example, true)}
            className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Volume2 className="w-3 h-3" />
            {t('listenToExample')}
          </button>
        </div>
      )}

      <button
        onClick={() => setShowExample(!showExample)}
        className="w-full text-indigo-600 text-sm mb-4 hover:text-indigo-800 transition-colors"
      >
        {showExample ? t('hideExample') : t('showExample')}
      </button>

      <div className="flex gap-3">
        <button
          onClick={() => onAnswer(false)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
        >
          <X className="w-5 h-5" />
          {t('hard')}
        </button>
        <button
          onClick={() => onAnswer(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Check className="w-5 h-5" />
          {t('easy')}
        </button>
      </div>
    </div>
  );
};