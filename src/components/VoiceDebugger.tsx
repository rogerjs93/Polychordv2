import React, { useState, useEffect, useMemo } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { testAllLanguageVoices, printVoiceReport, testLanguageSpeech, VoiceTestResult } from '../utils/voiceTest';

interface VoiceDebuggerProps {
  onClose?: () => void;
}

const VoiceDebugger: React.FC<VoiceDebuggerProps> = ({ onClose }) => {
  const { speak } = useSpeech();
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [testText, setTestText] = useState('Hola mundo');
  const [voiceResults, setVoiceResults] = useState<VoiceTestResult[]>([]);

  const supportedLanguages = useMemo(() => [
    { code: 'en', name: 'English', sample: 'Hello world' },
    { code: 'es', name: 'Spanish', sample: 'Hola mundo' },
    { code: 'fr', name: 'French', sample: 'Bonjour le monde' },
    { code: 'de', name: 'German', sample: 'Hallo Welt' },
    { code: 'it', name: 'Italian', sample: 'Ciao mondo' },
    { code: 'pt', name: 'Portuguese', sample: 'Olá mundo' },
    { code: 'ru', name: 'Russian', sample: 'Привет мир' },
    { code: 'ja', name: 'Japanese', sample: 'こんにちは世界' },
    { code: 'ko', name: 'Korean', sample: '안녕하세요 세계' },
    { code: 'zh', name: 'Chinese', sample: '你好世界' },
    { code: 'nl', name: 'Dutch', sample: 'Hallo wereld' },
    { code: 'sv', name: 'Swedish', sample: 'Hej världen' },
    { code: 'no', name: 'Norwegian', sample: 'Hei verden' },
    { code: 'da', name: 'Danish', sample: 'Hej verden' },
    { code: 'fi', name: 'Finnish', sample: 'Hei maailma' },
    { code: 'uk', name: 'Ukrainian', sample: 'Привіт світ' }
  ], []);

  useEffect(() => {
    // Update test text when language changes
    const lang = supportedLanguages.find(l => l.code === selectedLanguage);
    if (lang) {
      setTestText(lang.sample);
    }
  }, [selectedLanguage, supportedLanguages]);

  const runVoiceTest = () => {
    console.log('🧪 Running comprehensive voice test...');
    printVoiceReport();
    const results = testAllLanguageVoices();
    setVoiceResults(results);
  };

  const testSpeech = () => {
    console.log(`🎵 Testing speech for ${selectedLanguage}: "${testText}"`);
    speak(testText, selectedLanguage);
  };

  const testDirectSpeech = () => {
    console.log(`🎵 Testing direct speech synthesis for ${selectedLanguage}: "${testText}"`);
    testLanguageSpeech(selectedLanguage, testText);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🔊 Voice Debugger</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Test Controls */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Quick Test</h3>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="border rounded px-2 py-1 flex-1"
                placeholder="Text to speak"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={testSpeech}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Test with useSpeech
              </button>
              <button
                onClick={testDirectSpeech}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Test Direct Speech
              </button>
            </div>
          </div>

          {/* Comprehensive Test */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Comprehensive Analysis</h3>
            <button
              onClick={runVoiceTest}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Run Full Voice Test
            </button>
            <p className="text-sm text-gray-600 mt-1">
              Check browser console for detailed results
            </p>
          </div>

          {/* Results Display */}
          {voiceResults.length > 0 && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Voice Availability Results</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {voiceResults.map(result => (
                  <div
                    key={result.language}
                    className={`p-2 rounded ${
                      result.availableVoices.length > 0 
                        ? 'bg-green-100 text-green-800' 
                        : result.fallbackOptions.length > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <div className="font-medium">
                      {result.language.toUpperCase()} ({result.languageCode})
                    </div>
                    <div>
                      {result.availableVoices.length > 0 
                        ? `✅ ${result.availableVoices.length} voices`
                        : result.fallbackOptions.length > 0
                        ? `🔄 ${result.fallbackOptions.length} fallbacks`
                        : '❌ No voices'
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">🔧 How to Use</h3>
            <ul className="text-sm space-y-1">
              <li>• Use "Test with useSpeech" to test the app's speech system</li>
              <li>• Use "Test Direct Speech" to test browser's native speech</li>
              <li>• Run "Full Voice Test" to see all available voices</li>
              <li>• Check browser console for detailed logging</li>
              <li>• Try different languages to test voice availability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDebugger;
