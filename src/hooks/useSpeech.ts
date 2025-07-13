import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOpenSourceTTS } from './useOpenSourceTTS';

// Language-specific voice mapping for better pronunciation
const LANGUAGE_VOICE_MAP: { [key: string]: { 
  code: string; 
  preferredVoices: string[]; 
  fallbackLang: string;
  alternativeCodes: string[];
} } = {
  'en': { 
    code: 'en-US', 
    preferredVoices: ['Alex', 'Samantha', 'Microsoft David', 'Google US English'], 
    fallbackLang: 'en-US',
    alternativeCodes: ['en-GB', 'en-AU', 'en-CA', 'en-IN', 'en-NZ']
  },
  'es': { 
    code: 'es-ES', 
    preferredVoices: ['Monica', 'Paulina', 'Microsoft Helena', 'Google español'], 
    fallbackLang: 'es-ES',
    alternativeCodes: ['es-MX', 'es-AR', 'es-CO', 'es-VE', 'es-US']
  },
  'fr': { 
    code: 'fr-FR', 
    preferredVoices: ['Thomas', 'Amelie', 'Microsoft Julie', 'Google français'], 
    fallbackLang: 'fr-FR',
    alternativeCodes: ['fr-CA', 'fr-BE', 'fr-CH']
  },
  'de': { 
    code: 'de-DE', 
    preferredVoices: ['Anna', 'Yannick', 'Microsoft Stefan', 'Google Deutsch'], 
    fallbackLang: 'de-DE',
    alternativeCodes: ['de-AT', 'de-CH']
  },
  'it': { 
    code: 'it-IT', 
    preferredVoices: ['Alice', 'Luca', 'Microsoft Cosimo', 'Google italiano'], 
    fallbackLang: 'it-IT',
    alternativeCodes: ['it-CH']
  },
  'pt': { 
    code: 'pt-PT', 
    preferredVoices: ['Joana', 'Luciana', 'Microsoft Helia', 'Google português'], 
    fallbackLang: 'pt-PT',
    alternativeCodes: ['pt-BR']
  },
  'ru': { 
    code: 'ru-RU', 
    preferredVoices: ['Milena', 'Yuri', 'Microsoft Irina', 'Google русский'], 
    fallbackLang: 'ru-RU',
    alternativeCodes: ['ru-BY', 'ru-KZ']
  },
  'ja': { 
    code: 'ja-JP', 
    preferredVoices: ['Kyoko', 'Otoya', 'Microsoft Haruka', 'Google 日本語'], 
    fallbackLang: 'ja-JP',
    alternativeCodes: []
  },
  'ko': { 
    code: 'ko-KR', 
    preferredVoices: ['Yuna', 'Sora', 'Microsoft Heami', 'Google 한국의'], 
    fallbackLang: 'ko-KR',
    alternativeCodes: []
  },
  'zh': { 
    code: 'zh-CN', 
    preferredVoices: ['Ting-Ting', 'Sin-ji', 'Microsoft Huihui', 'Google 中文'], 
    fallbackLang: 'zh-CN',
    alternativeCodes: ['zh-TW', 'zh-HK', 'zh-SG']
  },
  'nl': { 
    code: 'nl-NL', 
    preferredVoices: ['Ellen', 'Xander', 'Microsoft Frank', 'Google Nederlands'], 
    fallbackLang: 'nl-NL',
    alternativeCodes: ['nl-BE']
  },
  'sv': { 
    code: 'sv-SE', 
    preferredVoices: ['Alva', 'Oskar', 'Microsoft Bengt', 'Google svenska'], 
    fallbackLang: 'sv-SE',
    alternativeCodes: ['sv-FI']
  },
  'no': { 
    code: 'nb-NO', 
    preferredVoices: ['Nora', 'Henrik', 'Microsoft Jon', 'Google norsk'], 
    fallbackLang: 'nb-NO',
    alternativeCodes: ['no-NO', 'nn-NO']
  },
  'da': { 
    code: 'da-DK', 
    preferredVoices: ['Sara', 'Magnus', 'Microsoft Helle', 'Google dansk'], 
    fallbackLang: 'da-DK',
    alternativeCodes: []
  },
  'fi': { 
    code: 'fi-FI', 
    preferredVoices: ['Satu', 'Onni', 'Microsoft Heidi', 'Google suomi'], 
    fallbackLang: 'fi-FI',
    alternativeCodes: []
  },
  'uk': { 
    code: 'uk-UA', 
    preferredVoices: ['Lesya', 'Microsoft Ostap', 'Google українська'], 
    fallbackLang: 'uk-UA',
    alternativeCodes: []
  }
};

// Helper function to get the best available voice for a language
const getBestVoiceForLanguage = (languageCode: string, availableVoices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  const langConfig = LANGUAGE_VOICE_MAP[languageCode];
  
  if (!langConfig || availableVoices.length === 0) {
    return null;
  }

  // Create a comprehensive list of language codes to search for
  const languageCodesToSearch = [
    langConfig.code,
    languageCode,
    ...langConfig.alternativeCodes
  ];

  console.log(`🔍 Searching for voice for language: ${languageCode}`);
  console.log(`📋 Available voices:`, availableVoices.map(v => `${v.name} (${v.lang})`));

  // Method 1: Try to find exact matches by language code
  for (const langCode of languageCodesToSearch) {
    const exactMatches = availableVoices.filter(v => 
      v.lang.toLowerCase() === langCode.toLowerCase()
    );
    
    if (exactMatches.length > 0) {
      // Look for preferred voices by name
      for (const preferredName of langConfig.preferredVoices) {
        const preferredVoice = exactMatches.find(v => 
          v.name.toLowerCase().includes(preferredName.toLowerCase())
        );
        if (preferredVoice) {
          console.log(`✅ Found preferred voice: ${preferredVoice.name} (${preferredVoice.lang})`);
          return preferredVoice;
        }
      }
      
      // Use the first exact match
      console.log(`✅ Using exact match: ${exactMatches[0].name} (${exactMatches[0].lang})`);
      return exactMatches[0];
    }
  }

  // Method 2: Try to find voices that start with the language code
  for (const langCode of languageCodesToSearch) {
    const partialMatches = availableVoices.filter(v => 
      v.lang.toLowerCase().startsWith(langCode.toLowerCase().split('-')[0])
    );
    
    if (partialMatches.length > 0) {
      console.log(`✅ Using partial match: ${partialMatches[0].name} (${partialMatches[0].lang})`);
      return partialMatches[0];
    }
  }

  // Method 3: Last resort - try to find any voice that contains the language
  const anyMatch = availableVoices.find(v => 
    v.lang.toLowerCase().includes(languageCode.toLowerCase())
  );
  
  if (anyMatch) {
    console.log(`✅ Using any match: ${anyMatch.name} (${anyMatch.lang})`);
    return anyMatch;
  }

  console.warn(`⚠️ No voice found for language: ${languageCode}`);
  return null;
};

// Helper function to get a guaranteed voice (with intelligent fallback)
const getGuaranteedVoice = (languageCode: string, availableVoices: SpeechSynthesisVoice[]): { voice: SpeechSynthesisVoice | null, lang: string } => {
  // Try to get the best voice for the requested language
  const bestVoice = getBestVoiceForLanguage(languageCode, availableVoices);
  
  if (bestVoice) {
    return { voice: bestVoice, lang: bestVoice.lang };
  }
  
  // If no native voice found, use English voice but with target language code
  // This helps the browser's TTS engine know what language to expect
  const englishVoice = getBestVoiceForLanguage('en', availableVoices);
  const langConfig = LANGUAGE_VOICE_MAP[languageCode];
  
  if (englishVoice && langConfig) {
    console.log(`🔄 Using English voice with ${languageCode} language code: ${englishVoice.name}`);
    console.log(`   This will help the TTS engine understand the target language`);
    return { 
      voice: englishVoice, 
      lang: langConfig.code // Use the target language code, not English
    };
  }
  
  // Fallback to English voice with English language
  if (englishVoice) {
    console.log(`🔄 Falling back to English voice: ${englishVoice.name} (${englishVoice.lang})`);
    return { voice: englishVoice, lang: englishVoice.lang };
  }
  
  // Last resort: use any available voice
  if (availableVoices.length > 0) {
    const fallbackVoice = availableVoices[0];
    const targetLang = langConfig ? langConfig.code : 'en-US';
    console.log(`🔄 Using first available voice with target language: ${fallbackVoice.name} → ${targetLang}`);
    return { voice: fallbackVoice, lang: targetLang };
  }
  
  // No voices available at all
  const fallbackLang = langConfig ? langConfig.fallbackLang : 'en-US';
  console.warn(`⚠️ No voices available. Using language code: ${fallbackLang}`);
  return { voice: null, lang: fallbackLang };
};

// Helper function to get the correct language code for speech synthesis
export const getLanguageCode = (languageCode: string): string => {
  const langConfig = LANGUAGE_VOICE_MAP[languageCode];
  return langConfig ? langConfig.code : 'en-US';
};

// Helper function to get available voices for a specific language
export const getVoicesForLanguage = (languageCode: string): SpeechSynthesisVoice[] => {
  if (!window.speechSynthesis) return [];
  
  const voices = window.speechSynthesis.getVoices();
  const langConfig = LANGUAGE_VOICE_MAP[languageCode];
  
  if (!langConfig) return [];
  
  const allLanguageCodes = [
    langConfig.code,
    languageCode,
    ...langConfig.alternativeCodes
  ];
  
  return voices.filter(v => 
    allLanguageCodes.some(code => 
      v.lang.toLowerCase().startsWith(code.toLowerCase()) ||
      v.lang.toLowerCase().startsWith(code.toLowerCase().split('-')[0])
    )
  );
};

// Helper function to check if any language is supported by open source providers
export const isLanguageSupportedByOpenSource = (languageCode: string, loadedProviders: string[]): boolean => {
  if (loadedProviders.length === 0) return false;
  
  // All our open source providers support these languages
  const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'nl', 'sv', 'no', 'da', 'fi', 'uk'];
  return supportedLanguages.includes(languageCode);
};

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const openSourceTTS = useOpenSourceTTS();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Debug: Log available voices for troubleshooting
        console.log('🔊 Available voices loaded:', availableVoices.length);
        console.log('📋 All available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
        
        // Check what languages we can support
        const supportedLanguages = Object.keys(LANGUAGE_VOICE_MAP);
        console.log('🌐 Checking voice support for supported languages:');
        
        let languagesWithNativeVoices = 0;
        const languagesWithoutVoices: string[] = [];
        
        supportedLanguages.forEach(lang => {
          const voices = getVoicesForLanguage(lang);
          console.log(`  ${lang}: ${voices.length} voices available`, voices.map(v => `${v.name} (${v.lang})`));
          
          if (voices.length > 0) {
            languagesWithNativeVoices++;
          } else {
            languagesWithoutVoices.push(lang);
          }
        });
        
        // Provide helpful guidance
        if (languagesWithoutVoices.length > 0) {
          console.log(`\n📝 Voice Installation Guide:`);
          console.log(`❌ Missing voices for: ${languagesWithoutVoices.join(', ')}`);
          console.log(`\n🔧 To install additional voices on Windows:`);
          console.log(`   1. Go to Settings → Time & Language → Language`);
          console.log(`   2. Add the languages you want`);
          console.log(`   3. Click on the language → Options → Speech`);
          console.log(`   4. Download the speech pack`);
          console.log(`   5. Restart your browser`);
          console.log(`\n🎵 Alternatively, use the Voice Options Manager for instant online voices`);
        } else {
          console.log(`✅ All ${languagesWithNativeVoices} languages have native voice support!`);
        }
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(async (text: string, language: string = 'en') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Extract language code (e.g., 'es' from 'es-ES')
      const langCode = language.includes('-') ? language.split('-')[0] : language;
      
      // Check if we have native voices for this language
      const nativeVoices = getVoicesForLanguage(langCode);
      const hasNativeVoice = nativeVoices.length > 0;
      
      // Check if we have open source support for this language
      const hasOpenSourceSupport = isLanguageSupportedByOpenSource(langCode, openSourceTTS.loadedProviders);
      
      console.log(`🎵 Speaking "${text}" in ${langCode}:`, {
        hasNativeVoice,
        hasOpenSourceSupport,
        nativeVoices: nativeVoices.length,
        loadedProviders: openSourceTTS.loadedProviders
      });
      
      // If we have native voices, try them first
      if (hasNativeVoice) {
        const { voice } = getGuaranteedVoice(langCode, voices);
        
        if (voice) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = voice;
          utterance.lang = voice.lang;
          utterance.rate = 0.85; // Slightly slower for better clarity
          utterance.pitch = 1;
          utterance.volume = 0.9;
          
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = async (e) => {
            console.error("Native speech synthesis error", e);
            setIsSpeaking(false);
            
            // Fallback to open source TTS if native fails
            if (hasOpenSourceSupport) {
              console.log('🔄 Falling back to open source TTS after native error');
              try {
                const success = await openSourceTTS.speak(text, langCode);
                if (!success) {
                  console.warn('⚠️ Open source TTS also failed');
                }
              } catch (error) {
                console.error('Open source TTS also failed:', error);
              }
            }
          };
          
          console.log(`🎵 Using native voice: ${voice.name} (${voice.lang})`);
          window.speechSynthesis.speak(utterance);
          return;
        }
      }
      
      // If no native voice available, or if we prefer open source, use open source TTS
      if (hasOpenSourceSupport) {
        console.log(`🔄 Using open source TTS for ${langCode}`);
        try {
          setIsSpeaking(true);
          const success = await openSourceTTS.speak(text, langCode);
          if (!success) {
            console.warn('⚠️ Open source TTS failed, trying basic fallback');
            // Final fallback to basic speech synthesis
            const { lang } = getGuaranteedVoice(langCode, voices);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.85;
            utterance.pitch = 1;
            utterance.volume = 0.9;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            console.log(`🎵 Final fallback: speaking "${text}" with language: ${lang}`);
            window.speechSynthesis.speak(utterance);
          } else {
            setIsSpeaking(false);
          }
        } catch (error) {
          console.error('Open source TTS failed:', error);
          setIsSpeaking(false);
        }
      } else {
        // No native voice and no open source support - final fallback
        console.warn(`⚠️ No voice support for ${langCode}, using basic fallback`);
        const { lang } = getGuaranteedVoice(langCode, voices);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 0.9;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        console.log(`🎵 Final fallback: speaking "${text}" with language: ${lang}`);
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [voices, openSourceTTS]);

  const startListening = useCallback((language: string = 'en-US'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser. Please use Chrome or Edge.'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3; // Get multiple alternatives for better matching
      
      let timeout: NodeJS.Timeout;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        
        // Set a timeout to stop listening after 5 seconds
        timeout = setTimeout(() => {
          recognition.stop();
          reject(new Error('No speech detected. Please try speaking closer to your microphone.'));
        }, 5000);
      };

      recognition.onresult = (event) => {
        clearTimeout(timeout);
        
        // Get the best result from alternatives
        let bestResult = '';
        let bestConfidence = 0;
        
        for (let i = 0; i < event.results[0].length; i++) {
          const alternative = event.results[0][i];
          if (alternative.confidence > bestConfidence) {
            bestConfidence = alternative.confidence;
            bestResult = alternative.transcript;
          }
        }
        
        setTranscript(bestResult);
        resolve(bestResult);
      };

      recognition.onerror = (event) => {
        clearTimeout(timeout);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error occurred.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        clearTimeout(timeout);
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch {
        setIsListening(false);
        reject(new Error('Failed to start speech recognition. Please try again.'));
      }
    });
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return useMemo(() => ({
    speak,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    transcript,
    openSourceTTS: {
      isLoading: openSourceTTS.isLoading,
      error: openSourceTTS.error,
      availableProviders: openSourceTTS.availableProviders,
      loadedProviders: openSourceTTS.loadedProviders
    }
  }), [speak, startListening, stopListening, isSpeaking, isListening, transcript, openSourceTTS]);
};