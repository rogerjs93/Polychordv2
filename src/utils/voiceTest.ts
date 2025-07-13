/**
 * Voice Testing Utility for debugging speech synthesis issues
 * This utility helps test and debug voice availability for different languages
 */

import { getLanguageCode, getVoicesForLanguage } from '../hooks/useSpeech';

export interface VoiceTestResult {
  language: string;
  languageCode: string;
  availableVoices: SpeechSynthesisVoice[];
  recommendedVoice: SpeechSynthesisVoice | null;
  fallbackOptions: SpeechSynthesisVoice[];
}

/**
 * Test voice availability for all supported languages
 */
export const testAllLanguageVoices = (): VoiceTestResult[] => {
  const supportedLanguages = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
    'nl', 'sv', 'no', 'da', 'fi', 'uk'
  ];

  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return [];
  }

  const allVoices = window.speechSynthesis.getVoices();
  
  return supportedLanguages.map(lang => {
    const languageCode = getLanguageCode(lang);
    const availableVoices = getVoicesForLanguage(lang);
    
    // Find the best recommended voice
    const recommendedVoice = availableVoices.length > 0 ? availableVoices[0] : null;
    
    // Find fallback options (any voice that might work)
    const fallbackOptions = allVoices.filter(voice => 
      voice.lang.toLowerCase().includes(lang) ||
      voice.name.toLowerCase().includes(lang)
    );

    return {
      language: lang,
      languageCode,
      availableVoices,
      recommendedVoice,
      fallbackOptions
    };
  });
};

/**
 * Print a detailed voice availability report
 */
export const printVoiceReport = (): void => {
  console.log('🔊 Voice Availability Report');
  console.log('============================');
  
  const results = testAllLanguageVoices();
  
  results.forEach(result => {
    console.log(`\n📝 ${result.language.toUpperCase()} (${result.languageCode}):`);
    
    if (result.availableVoices.length > 0) {
      console.log(`  ✅ ${result.availableVoices.length} native voices available:`);
      result.availableVoices.forEach(voice => 
        console.log(`    - ${voice.name} (${voice.lang})`)
      );
    } else {
      console.log(`  ❌ No native voices found`);
      
      if (result.fallbackOptions.length > 0) {
        console.log(`  🔄 ${result.fallbackOptions.length} fallback options:`);
        result.fallbackOptions.forEach(voice => 
          console.log(`    - ${voice.name} (${voice.lang})`)
        );
      } else {
        console.log(`  ⚠️ No fallback options available`);
      }
    }
  });
  
  // Summary
  const languagesWithVoices = results.filter(r => r.availableVoices.length > 0).length;
  const languagesWithFallbacks = results.filter(r => r.fallbackOptions.length > 0).length;
  
  console.log(`\n📊 Summary:`);
  console.log(`  • ${languagesWithVoices}/${results.length} languages have native voices`);
  console.log(`  • ${languagesWithFallbacks}/${results.length} languages have fallback options`);
  console.log(`  • Total voices available: ${window.speechSynthesis.getVoices().length}`);
};

/**
 * Test speech synthesis for a specific language
 */
export const testLanguageSpeech = (language: string, text: string = 'Hello world'): void => {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  const languageCode = getLanguageCode(language);
  const availableVoices = getVoicesForLanguage(language);
  
  console.log(`🧪 Testing speech for ${language} (${languageCode})`);
  console.log(`📝 Text: "${text}"`);
  
  if (availableVoices.length > 0) {
    const voice = availableVoices[0];
    console.log(`🎵 Using voice: ${voice.name} (${voice.lang})`);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.85;
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn(`⚠️ No voices available for ${language}, using default`);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = 0.85;
    
    window.speechSynthesis.speak(utterance);
  }
};
