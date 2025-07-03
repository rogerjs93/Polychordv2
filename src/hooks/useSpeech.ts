import { useState, useEffect, useCallback } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, language: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      
      if (voice) {
        utterance.voice = voice;
      } else {
        utterance.lang = language;
        console.warn(`No specific voice found for language '${language}'. Using browser default.`);
      }

      utterance.rate = 0.9; 
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, [voices]);

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
      } catch (error) {
        setIsListening(false);
        reject(new Error('Failed to start speech recognition. Please try again.'));
      }
    });
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    speak,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    transcript
  };
};