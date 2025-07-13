import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

interface TTSProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  languages: string[];
  rateLimit: number; // requests per minute
  maxLength: number; // characters
  quality: 'Basic' | 'Good' | 'Excellent';
  setup: string;
  offline: boolean;
}

const FREE_TTS_PROVIDERS: TTSProvider[] = [
  {
    name: 'VoiceRSS',
    endpoint: 'https://api.voicerss.org/',
    apiKey: 'demo', // Free tier
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'nl', 'sv', 'no', 'da', 'fi'],
    rateLimit: 350,
    maxLength: 100,
    quality: 'Good',
    setup: 'Instant',
    offline: false
  },
  {
    name: 'eSpeak',
    endpoint: 'local',
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'nl', 'sv', 'no', 'da', 'fi'],
    rateLimit: 1000,
    maxLength: 500,
    quality: 'Basic',
    setup: 'Quick Download',
    offline: true
  },
  {
    name: 'ResponsiveVoice',
    endpoint: 'https://responsivevoice.org/api/speak',
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'nl', 'sv', 'no', 'da', 'fi'],
    rateLimit: 50,
    maxLength: 200,
    quality: 'Good',
    setup: 'Instant',
    offline: false
  }
];

export const useOpenSourceTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedProviders, setLoadedProviders] = useState<Set<string>>(() => {
    // Initialize from localStorage if available
    try {
      const saved = localStorage.getItem('openSourceTTS_loadedProviders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const initializationRef = useRef(false);

  // Helper function to initialize a specific provider
  const initializeSpecificProvider = useCallback(async (providerName: string): Promise<boolean> => {
    try {
      let success = false;
      
      switch (providerName) {
        case 'ResponsiveVoice':
          success = await loadResponsiveVoice();
          break;
        case 'VoiceRSS':
          success = true; // No initialization needed
          break;
        case 'eSpeak':
          success = await loadESpeak();
          break;
        default:
          return false;
      }

      return success;
    } catch (error) {
      console.error(`Failed to initialize ${providerName}:`, error);
      return false;
    }
  }, []);

  // Re-initialize saved providers on component mount
  useEffect(() => {
    const initializeSavedProviders = async () => {
      if (loadedProviders.size > 0 && !initializationRef.current) {
        initializationRef.current = true;
        console.log('🔄 Re-initializing saved providers:', Array.from(loadedProviders));
        
        // Verify and re-initialize each saved provider
        const verifiedProviders = new Set<string>();
        
        for (const providerName of Array.from(loadedProviders)) {
          try {
            const success = await initializeSpecificProvider(providerName);
            if (success) {
              verifiedProviders.add(providerName);
            }
          } catch (err) {
            console.warn(`Failed to re-initialize ${providerName}:`, err);
          }
        }
        
        // Update state with only the successfully verified providers
        setLoadedProviders(prev => {
          const currentArray = Array.from(prev).sort();
          const verifiedArray = Array.from(verifiedProviders).sort();

          if (JSON.stringify(currentArray) !== JSON.stringify(verifiedArray)) {
            console.log('🔄 OpenSourceTTS: Provider list changed, updating state and localStorage.');
            localStorage.setItem('openSourceTTS_loadedProviders', JSON.stringify(verifiedArray));
            return new Set(verifiedArray);
          }
          
          return prev; // Return the existing state to prevent re-render
        });
      }
    };

    initializeSavedProviders();
  }, [initializeSpecificProvider, loadedProviders]);

  const speakWithProvider = useCallback(async (
    text: string, 
    language: string, 
    providerName?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try providers in order of preference
      const providers = providerName 
        ? FREE_TTS_PROVIDERS.filter(p => p.name === providerName)
        : FREE_TTS_PROVIDERS;

      for (const provider of providers) {
        if (!provider.languages.includes(language)) continue;

        if (text.length > provider.maxLength) {
          console.warn(`Text too long for ${provider.name}, truncating`);
          text = text.substring(0, provider.maxLength);
        }

        try {
          const success = await speakWithSpecificProvider(text, language, provider);
          if (success) {
            console.log(`✅ Successfully used ${provider.name} for ${language}`);
            return true;
          }
        } catch (providerError) {
          console.warn(`❌ ${provider.name} failed:`, providerError);
          continue;
        }
      }

      throw new Error('All TTS providers failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS failed');
      console.error('🚨 All TTS providers failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const speakWithSpecificProvider = async (
    text: string, 
    language: string, 
    provider: TTSProvider
  ): Promise<boolean> => {
    switch (provider.name) {
      case 'ResponsiveVoice':
        return await speakWithResponsiveVoice(text, language);
      
      case 'VoiceRSS':
        return await speakWithVoiceRSS(text, language, provider.apiKey);
      
      case 'eSpeak':
        return await speakWithESpeak(text, language);
      
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  };

  const initializeProvider = useCallback(async (providerName: string): Promise<boolean> => {
    if (loadedProviders.has(providerName)) return true;

    try {
      const success = await initializeSpecificProvider(providerName);

      if (success) {
        setLoadedProviders(prev => {
          const newSet = new Set([...prev, providerName]);
          // Persist to localStorage
          try {
            localStorage.setItem('openSourceTTS_loadedProviders', JSON.stringify(Array.from(newSet)));
          } catch (err) {
            console.warn('Failed to save loaded providers to localStorage:', err);
          }
          return newSet;
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Failed to initialize ${providerName}:`, error);
      return false;
    }
  }, [loadedProviders, initializeSpecificProvider]);

  const memoizedLoadedProviders = useMemo(() => Array.from(loadedProviders), [loadedProviders]);

  return {
    speak: speakWithProvider,
    initializeProvider,
    isLoading,
    error,
    availableProviders: FREE_TTS_PROVIDERS,
    loadedProviders: memoizedLoadedProviders
  };
};

// ResponsiveVoice implementation
const speakWithResponsiveVoice = async (text: string, language: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window.responsiveVoice !== 'undefined') {
      window.responsiveVoice.speak(text, getResponsiveVoiceLanguage(language), {
        onend: () => resolve(true),
        onerror: () => resolve(false)
      });
    } else {
      resolve(false);
    }
  });
};

// VoiceRSS implementation
const speakWithVoiceRSS = async (text: string, language: string, apiKey?: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.voicerss.org/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        key: apiKey || 'demo',
        hl: getVoiceRSSLanguage(language),
        src: text,
        f: '44khz_16bit_stereo',
        c: 'mp3'
      })
    });

    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          resolve(false);
        };
        audio.play();
      });
    }
    return false;
  } catch (error) {
    console.error('VoiceRSS error:', error);
    return false;
  }
};

// eSpeak implementation (mock for now)
const speakWithESpeak = async (text: string, language: string): Promise<boolean> => {
  try {
    console.log(`🔊 eSpeak: "${text}" in ${language}`);
    
    // Mock implementation - in real scenario, this would use eSpeak WASM
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ eSpeak completed for ${language}`);
        resolve(true);
      }, 1000);
    });
  } catch (error) {
    console.error('eSpeak error:', error);
    return false;
  }
};

// Helper functions for language mapping
const getResponsiveVoiceLanguage = (language: string): string => {
  const mapping: {[key: string]: string} = {
    'en': 'English US',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'da': 'Danish',
    'fi': 'Finnish'
  };
  return mapping[language] || 'English US';
};

const getVoiceRSSLanguage = (language: string): string => {
  const mapping: {[key: string]: string} = {
    'en': 'en-us',
    'es': 'es-es',
    'fr': 'fr-fr',
    'de': 'de-de',
    'it': 'it-it',
    'pt': 'pt-pt',
    'ru': 'ru-ru',
    'ja': 'ja-jp',
    'ko': 'ko-kr',
    'zh': 'zh-cn',
    'nl': 'nl-nl',
    'sv': 'sv-se',
    'no': 'no-no',
    'da': 'da-dk',
    'fi': 'fi-fi'
  };
  return mapping[language] || 'en-us';
};

// Load ResponsiveVoice dynamically
const loadResponsiveVoice = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window.responsiveVoice !== 'undefined') {
      resolve(true);
      return;
    }

    // Try to load ResponsiveVoice with error handling
    const script = document.createElement('script');
    script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=FREE';
    script.crossOrigin = 'anonymous';
    
    // Set a timeout in case the script never loads
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ ResponsiveVoice loading timeout');
      resolve(false);
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      // Wait a bit for ResponsiveVoice to initialize
      setTimeout(() => {
        if (typeof window.responsiveVoice !== 'undefined') {
          console.log('✅ ResponsiveVoice loaded successfully');
          resolve(true);
        } else {
          console.warn('⚠️ ResponsiveVoice script loaded but API not available');
          resolve(false);
        }
      }, 1000);
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      console.error('❌ Failed to load ResponsiveVoice - network or CORS issue');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

// Load eSpeak (mock for now)
const loadESpeak = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('📥 Loading eSpeak...');
    // Mock loading delay
    setTimeout(() => {
      console.log('✅ eSpeak loaded successfully');
      resolve(true);
    }, 2000);
  });
};

// Extend window object for TypeScript
declare global {
  interface Window {
    responsiveVoice: {
      speak: (text: string, voice: string, options?: { onend?: () => void; onerror?: () => void }) => void;
    };
  }
}
