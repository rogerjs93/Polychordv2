import React, { useState, useEffect } from 'react';
import { getVoicesForLanguage, useSpeech, isLanguageSupportedByOpenSource } from '../hooks/useSpeech';
import VoiceInstallationWizard from './VoiceInstallationWizard';
import VoiceOptionsManager from './VoiceOptionsManager';

const VoiceStatus: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);
  const [voiceStats, setVoiceStats] = useState({ total: 0, languages: 0 });
  const { openSourceTTS, speak } = useSpeech();

  useEffect(() => {
    const updateVoiceStats = () => {
      const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'nl', 'sv', 'no', 'da', 'fi', 'uk'];
      
      console.log('🔄 VoiceStatus: Updating voice stats');
      console.log('🌐 Open source loaded providers:', openSourceTTS.loadedProviders);
      
      // Count languages with either native voices OR working open source providers
      const languagesWithVoices = supportedLanguages.filter(lang => {
        const nativeVoices = getVoicesForLanguage(lang);
        const hasNativeVoice = nativeVoices.length > 0;
        const hasOpenSourceSupport = isLanguageSupportedByOpenSource(lang, openSourceTTS.loadedProviders);
        
        console.log(`📊 ${lang}: native=${hasNativeVoice} (${nativeVoices.length}), openSource=${hasOpenSourceSupport}`);
        
        return hasNativeVoice || hasOpenSourceSupport;
      });
      
      // Total includes both native voices and open source providers
      const totalVoiceSources = window.speechSynthesis.getVoices().length + openSourceTTS.loadedProviders.length;
      
      setVoiceStats({
        total: totalVoiceSources,
        languages: languagesWithVoices.length
      });
      
      console.log(`🎵 Voice Status Update:`, {
        nativeVoices: window.speechSynthesis.getVoices().length,
        openSourceProviders: openSourceTTS.loadedProviders.length,
        languagesSupported: languagesWithVoices.length
      });
    };

    window.speechSynthesis.onvoiceschanged = updateVoiceStats;
    updateVoiceStats();

    // Listen for system wizard open event
    const handleOpenSystemWizard = () => {
      setShowVoiceOptions(false);
      setShowWizard(true);
    };

    window.addEventListener('openSystemVoiceWizard', handleOpenSystemWizard);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.removeEventListener('openSystemVoiceWizard', handleOpenSystemWizard);
    };
  }, [openSourceTTS.loadedProviders]);

  const getStatusColor = () => {
    if (voiceStats.languages >= 10) return 'text-green-600';
    if (voiceStats.languages >= 5) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (voiceStats.languages >= 10) return '🎵';
    if (voiceStats.languages >= 5) return '🔊';
    return '🔤';
  };

  const testVoice = async (lang: string, text: string) => {
    console.log(`🎵 Testing voice for ${lang}: "${text}"`);
    
    // Use the enhanced speak function that includes open source fallbacks
    await speak(text, lang);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-4 right-4 ${getStatusColor()} bg-white shadow-lg rounded-full p-3 border-2 border-current hover:shadow-xl transition-all z-50`}
        title={`Voice Status: ${voiceStats.languages}/16 languages supported`}
      >
        <span className="text-lg">{getStatusIcon()}</span>
        <span className="ml-1 text-sm font-medium">{voiceStats.languages}/16</span>
      </button>
    );
  }

  const supportedLanguages = [
    { code: 'en', name: 'English', sample: 'Hello world' },
    { code: 'es', name: 'Spanish', sample: 'Hola mundo' },
    { code: 'fr', name: 'French', sample: 'Bonjour monde' },
    { code: 'de', name: 'German', sample: 'Hallo Welt' },
    { code: 'it', name: 'Italian', sample: 'Ciao mondo' },
    { code: 'pt', name: 'Portuguese', sample: 'Olá mundo' },
    { code: 'ru', name: 'Russian', sample: 'Привет мир' },
    { code: 'ja', name: 'Japanese', sample: 'こんにちは' },
    { code: 'ko', name: 'Korean', sample: '안녕하세요' },
    { code: 'zh', name: 'Chinese', sample: '你好' },
    { code: 'nl', name: 'Dutch', sample: 'Hallo wereld' },
    { code: 'sv', name: 'Swedish', sample: 'Hej världen' },
    { code: 'no', name: 'Norwegian', sample: 'Hei verden' },
    { code: 'da', name: 'Danish', sample: 'Hej verden' },
    { code: 'fi', name: 'Finnish', sample: 'Hei maailma' },
    { code: 'uk', name: 'Ukrainian', sample: 'Привіт світ' }
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-xl rounded-lg p-4 border max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">🎵 Voice Status</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 text-sm">
        <div className={`${getStatusColor()} font-medium`}>
          {voiceStats.languages}/16 languages supported
        </div>
        <div className="text-gray-600">
          {window.speechSynthesis.getVoices().length} native voices + {openSourceTTS.loadedProviders.length} online providers
        </div>
        {openSourceTTS.loadedProviders.length > 0 && (
          <div className="text-green-600 text-xs mt-1">
            🌐 Online: {openSourceTTS.loadedProviders.join(', ')}
          </div>
        )}
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {supportedLanguages.map(lang => {
          const nativeVoices = getVoicesForLanguage(lang.code);
          const hasNativeVoice = nativeVoices.length > 0;
          const hasOpenSourceSupport = isLanguageSupportedByOpenSource(lang.code, openSourceTTS.loadedProviders);
          const hasAnyVoice = hasNativeVoice || hasOpenSourceSupport;
          
          return (
            <div key={lang.code} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className={hasAnyVoice ? 'text-green-600' : 'text-gray-400'}>
                  {hasNativeVoice ? '🖥️' : hasOpenSourceSupport ? '🌐' : '🔤'}
                </span>
                <span className={hasAnyVoice ? 'text-gray-800' : 'text-gray-500'}>
                  {lang.name}
                  {hasNativeVoice && hasOpenSourceSupport && (
                    <span className="text-green-500 ml-1">+</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => testVoice(lang.code, lang.sample)}
                className={`px-1 ${hasAnyVoice ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400'}`}
                title={`Test ${lang.name} pronunciation`}
                disabled={!hasAnyVoice}
              >
                ▶️
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
        {voiceStats.languages < 16 && (
          <div className="space-y-2">
            <div>
              💡 <strong>Want better pronunciation?</strong><br/>
              Choose your preferred voice setup method
            </div>
            <button
              onClick={() => setShowVoiceOptions(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-2 rounded text-sm hover:from-blue-600 hover:to-green-600 transition-colors"
            >
              🎵 Setup Voice Options
            </button>
            <div className="text-center text-xs text-gray-500">
              Choose between system installation or instant online voices
            </div>
          </div>
        )}
        {voiceStats.languages >= 16 && (
          <div className="text-green-600">
            🎉 <strong>Perfect!</strong> All languages supported
          </div>
        )}
      </div>

      {/* Voice Options Manager */}
      {showVoiceOptions && (
        <VoiceOptionsManager
          onClose={() => setShowVoiceOptions(false)}
        />
      )}

      {/* Voice Installation Wizard */}
      {showWizard && (
        <VoiceInstallationWizard
          onClose={() => setShowWizard(false)}
          onSkip={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

export default VoiceStatus;
