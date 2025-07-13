import { useState, useEffect } from 'react';
import { getVoicesForLanguage } from './useSpeech';

export const useVoiceInstallationPrompt = () => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(false);

  useEffect(() => {
    const checkVoiceAvailability = () => {
      // Check if user has already been prompted
      const hasSeenPrompt = localStorage.getItem('voice-installation-prompted');
      if (hasSeenPrompt) {
        setHasBeenPrompted(true);
        return;
      }

      // Check how many languages have voices
      const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
      const languagesWithVoices = supportedLanguages.filter(lang => 
        getVoicesForLanguage(lang).length > 0
      );

      // Show prompt if user has 3 or fewer languages with voices
      if (languagesWithVoices.length <= 3) {
        // Wait 5 seconds after app loads to show prompt
        setTimeout(() => {
          setShouldShowPrompt(true);
        }, 5000);
      }
    };

    // Listen for voice changes
    const handleVoicesChanged = () => {
      checkVoiceAvailability();
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    checkVoiceAvailability();

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  const markAsPrompted = () => {
    localStorage.setItem('voice-installation-prompted', 'true');
    setHasBeenPrompted(true);
    setShouldShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShouldShowPrompt(false);
  };

  const resetPrompt = () => {
    localStorage.removeItem('voice-installation-prompted');
    setHasBeenPrompted(false);
    setShouldShowPrompt(true);
  };

  return {
    shouldShowPrompt,
    hasBeenPrompted,
    markAsPrompted,
    dismissPrompt,
    resetPrompt
  };
};
