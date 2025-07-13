import { VocabularyItem } from '../types';

/**
 * Language detection and voice utilities for the Polychord language learning app
 */

// Comprehensive language patterns for detection
const LANGUAGE_PATTERNS = {
  es: /[ñáéíóúü]/,
  fr: /[àâäçéèêëïîôûùü]/,
  de: /[äöüß]/,
  it: /[àèìíîòóù]/,
  pt: /[ãâáàçéêíóôõú]/,
  ru: /[а-яё]/i,
  ja: /[ひらがなカタカナ一-龯]/,
  ko: /[가-힣]/,
  zh: /[\u4e00-\u9fff]/,
  nl: /[ëïüáéíóú]/,
  sv: /[åäöé]/,
  no: /[æøå]/,
  da: /[æøå]/,
  fi: /[äöåé]/,
  uk: /[ієї]/
} as const;

// Language code mapping for speech synthesis
const LANGUAGE_CODE_MAP = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  nl: 'nl-NL',
  sv: 'sv-SE',
  no: 'no-NO',
  da: 'da-DK',
  fi: 'fi-FI',
  uk: 'uk-UA'
} as const;

// Common words for additional language detection
const COMMON_WORDS = {
  es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al'],
  fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne'],
  de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein'],
  it: ['il', 'di', 'che', 'è', 'e', 'la', 'per', 'una', 'in', 'del', 'un', 'da', 'al', 'le', 'si', 'dei', 'come', 'io', 'questo'],
  pt: ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por'],
  ru: ['в', 'и', 'не', 'на', 'я', 'быть', 'то', 'он', 'мы', 'что', 'все', 'она', 'так', 'его', 'но', 'да', 'ты', 'к', 'у'],
  nl: ['de', 'van', 'het', 'een', 'en', 'in', 'te', 'dat', 'op', 'voor', 'met', 'als', 'zijn', 'er', 'aan', 'door', 'om', 'nog']
} as const;

/**
 * Detects the target language from vocabulary items using multiple heuristics
 */
export const detectLanguageFromVocabulary = (vocabulary: VocabularyItem[]): string => {
  if (!vocabulary || vocabulary.length === 0) return 'en';

  // Check for explicit language information
  const firstWord = vocabulary[0];
  if ('language' in firstWord && firstWord.language) return firstWord.language as string;
  if ('targetLanguage' in firstWord && firstWord.targetLanguage) return firstWord.targetLanguage as string;

  // Collect text samples from vocabulary
  const textSamples = vocabulary.slice(0, 10).flatMap(item => [
    item.word,
    item.translation,
    item.example || '',
    item.exampleTranslation || ''
  ]).filter(Boolean);

  const languageScores: { [key: string]: number } = {};

  // Score based on character patterns
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    languageScores[lang] = 0;
    for (const text of textSamples) {
      const matches = text.match(pattern);
      if (matches) {
        languageScores[lang] += matches.length;
      }
    }
  }

  // Score based on common words
  for (const [lang, commonWords] of Object.entries(COMMON_WORDS)) {
    for (const text of textSamples) {
      const words = text.toLowerCase().split(/\s+/);
      for (const word of words) {
        if ((commonWords as readonly string[]).includes(word)) {
          languageScores[lang] = (languageScores[lang] || 0) + 2; // Higher weight for common words
        }
      }
    }
  }

  // Find the language with the highest score
  const detectedLang = Object.entries(languageScores)
    .sort(([, a], [, b]) => b - a)
    .find(([, score]) => score > 0)?.[0];

  const result = detectedLang || 'en';
  console.log(`🔍 Language detection results:`, languageScores, `-> ${result}`);
  
  return result;
};

/**
 * Gets the correct language code for speech synthesis
 */
export const getLanguageCodeForSpeech = (languageCode: string): string => {
  return LANGUAGE_CODE_MAP[languageCode as keyof typeof LANGUAGE_CODE_MAP] || 'en-US';
};

/**
 * Gets the display name for a language code
 */
export const getLanguageDisplayName = (languageCode: string): string => {
  const displayNames: { [key: string]: string } = {
    en: 'English',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)', 
    it: 'Italian (Italiano)',
    pt: 'Portuguese (Português)',
    ru: 'Russian (Русский)',
    ja: 'Japanese (日本語)',
    ko: 'Korean (한국어)',
    zh: 'Chinese (中文)',
    nl: 'Dutch (Nederlands)',
    sv: 'Swedish (Svenska)',
    no: 'Norwegian (Norsk)',
    da: 'Danish (Dansk)',
    fi: 'Finnish (Suomi)',
    uk: 'Ukrainian (Українська)'
  };

  return displayNames[languageCode] || languageCode;
};

/**
 * Checks if a language is supported for speech synthesis
 */
export const isLanguageSupported = (languageCode: string): boolean => {
  return languageCode in LANGUAGE_CODE_MAP;
};

/**
 * Gets all supported language codes
 */
export const getSupportedLanguages = (): string[] => {
  return Object.keys(LANGUAGE_CODE_MAP);
};
