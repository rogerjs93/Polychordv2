import React, { useState } from 'react';
import { getVoicesForLanguage } from '../hooks/useSpeech';

interface VoiceInstallationWizardProps {
  onClose: () => void;
  onSkip: () => void;
}

// Platform detection
const detectPlatform = (): 'windows' | 'mac' | 'linux' | 'unknown' => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  return 'unknown';
};

const VoiceInstallationWizard: React.FC<VoiceInstallationWizardProps> = ({ onClose, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [installationProgress, setInstallationProgress] = useState<{[key: string]: 'pending' | 'checking' | 'found' | 'missing'}>({});
  const [detectedPlatform] = useState(detectPlatform());
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac' | 'linux' | null>(null);
  const [needsBrowserRestart, setNeedsBrowserRestart] = useState(false);

  // Enhanced language list with platform-specific information
  const languageOptions = {
    popular: [
      { 
        code: 'es', 
        name: 'Spanish', 
        nativeName: 'Español',
        windows: 'Spanish (Spain)', 
        mac: 'Spanish (Spain)', 
        linux: 'espeak-data-es' 
      },
      { 
        code: 'fr', 
        name: 'French', 
        nativeName: 'Français',
        windows: 'French (France)', 
        mac: 'French (France)', 
        linux: 'espeak-data-fr' 
      },
      { 
        code: 'de', 
        name: 'German', 
        nativeName: 'Deutsch',
        windows: 'German (Germany)', 
        mac: 'German (Germany)', 
        linux: 'espeak-data-de' 
      },
      { 
        code: 'it', 
        name: 'Italian', 
        nativeName: 'Italiano',
        windows: 'Italian (Italy)', 
        mac: 'Italian (Italy)', 
        linux: 'espeak-data-it' 
      },
      { 
        code: 'pt', 
        name: 'Portuguese', 
        nativeName: 'Português',
        windows: 'Portuguese (Brazil)', 
        mac: 'Portuguese (Brazil)', 
        linux: 'espeak-data-pt' 
      },
    ],
    other: [
      { 
        code: 'ru', 
        name: 'Russian', 
        nativeName: 'Русский',
        windows: 'Russian (Russia)', 
        mac: 'Russian (Russia)', 
        linux: 'espeak-data-ru' 
      },
      { 
        code: 'ja', 
        name: 'Japanese', 
        nativeName: '日本語',
        windows: 'Japanese (Japan)', 
        mac: 'Japanese (Japan)', 
        linux: 'espeak-data-ja' 
      },
      { 
        code: 'ko', 
        name: 'Korean', 
        nativeName: '한국어',
        windows: 'Korean (Korea)', 
        mac: 'Korean (Korea)', 
        linux: 'espeak-data-ko' 
      },
      { 
        code: 'zh', 
        name: 'Chinese', 
        nativeName: '中文',
        windows: 'Chinese (Simplified, China)', 
        mac: 'Chinese (China)', 
        linux: 'espeak-data-zh' 
      },
      { 
        code: 'nl', 
        name: 'Dutch', 
        nativeName: 'Nederlands',
        windows: 'Dutch (Netherlands)', 
        mac: 'Dutch (Netherlands)', 
        linux: 'espeak-data-nl' 
      },
      { 
        code: 'sv', 
        name: 'Swedish', 
        nativeName: 'Svenska',
        windows: 'Swedish (Sweden)', 
        mac: 'Swedish (Sweden)', 
        linux: 'espeak-data-sv' 
      },
      { 
        code: 'no', 
        name: 'Norwegian', 
        nativeName: 'Norsk',
        windows: 'Norwegian (Norway)', 
        mac: 'Norwegian (Norway)', 
        linux: 'espeak-data-no' 
      },
      { 
        code: 'da', 
        name: 'Danish', 
        nativeName: 'Dansk',
        windows: 'Danish (Denmark)', 
        mac: 'Danish (Denmark)', 
        linux: 'espeak-data-da' 
      },
      { 
        code: 'fi', 
        name: 'Finnish', 
        nativeName: 'Suomi',
        windows: 'Finnish (Finland)', 
        mac: 'Finnish (Finland)', 
        linux: 'espeak-data-fi' 
      },
      { 
        code: 'uk', 
        name: 'Ukrainian', 
        nativeName: 'Українська',
        windows: 'Ukrainian (Ukraine)', 
        mac: 'Ukrainian (Ukraine)', 
        linux: 'espeak-data-uk' 
      },
    ]
  };

  const checkVoiceAvailability = async () => {
    setIsChecking(true);
    const progress: {[key: string]: 'pending' | 'checking' | 'found' | 'missing'} = {};
    
    for (const lang of selectedLanguages) {
      progress[lang] = 'checking';
      setInstallationProgress({...progress});
      
      // Small delay to show checking state
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const voices = getVoicesForLanguage(lang);
      progress[lang] = voices.length > 0 ? 'found' : 'missing';
      setInstallationProgress({...progress});
    }
    
    setIsChecking(false);
    
    // Check if any voices are still missing
    const missingVoices = Object.values(progress).some(status => status === 'missing');
    if (missingVoices) {
      setNeedsBrowserRestart(true);
      // Store timestamp for browser restart notification
      localStorage.setItem('lastVoiceCheck', Date.now().toString());
    }
  };

  const getInstructionsForPlatform = (platform: 'windows' | 'mac' | 'linux') => {
    switch (platform) {
      case 'windows':
        return {
          title: '🪟 Windows Installation Instructions',
          icon: '🪟',
          steps: [
            '1. Press Win+I to open Windows Settings',
            '2. Click on "Time & Language"',
            '3. Click on "Language & Region" in the left sidebar',
            '4. Click "Add a language" button',
            '5. Search for and select your desired language',
            '6. Click "Next" and then "Install"',
            '7. After installation, click on the language',
            '8. Click "Language options"',
            '9. Under "Speech", click "Download" for text-to-speech',
            '10. Wait for download to complete',
            '11. Close and restart your browser completely!'
          ],
          note: '⚠️ Important: You must completely close and restart your browser after installing new languages for voices to be detected.',
          additionalTips: [
            '💡 Downloads can take 5-15 minutes depending on your internet speed',
            '💡 Some languages may require a Windows restart (system will notify you)',
            '💡 You can install multiple languages at once',
            '💡 Make sure you download the "Speech" pack, not just the language pack'
          ]
        };
      
      case 'mac':
        return {
          title: '🍎 macOS Installation Instructions',
          icon: '🍎',
          steps: [
            '1. Click the Apple menu → System Preferences (or System Settings)',
            '2. Click on "Accessibility"',
            '3. Click "Spoken Content" in the left sidebar',
            '4. Click "System Voice" dropdown',
            '5. Click "Customize..." at the bottom of the list',
            '6. Check the boxes for languages you want to install',
            '7. Click "OK" to start downloading voices',
            '8. Wait for downloads to complete (can be large files)',
            '9. Close and restart your browser completely!'
          ],
          note: '⚠️ Important: You must completely close and restart your browser after installing new voices for them to be detected.',
          additionalTips: [
            '💡 Alternative path: System Preferences → Speech → System Voice → Customize',
            '💡 High-quality voices are larger downloads (100-500MB each)',
            '💡 You can preview voices before downloading',
            '💡 Consider downloading "Enhanced" or "Premium" quality voices for best results'
          ]
        };
      
      case 'linux':
        return {
          title: '🐧 Linux Installation Instructions',
          icon: '🐧',
          steps: [
            '1. Open Terminal (Ctrl+Alt+T)',
            '2. Update package manager: sudo apt update',
            '3. Install espeak and festival: sudo apt install espeak espeak-data festival',
            '4. Install language-specific packages:',
            '   • Spanish: sudo apt install espeak-data-es',
            '   • French: sudo apt install espeak-data-fr',
            '   • German: sudo apt install espeak-data-de',
            '   • Italian: sudo apt install espeak-data-it',
            '5. Optional: Install speech-dispatcher for better integration',
            '   sudo apt install speech-dispatcher',
            '6. Close and restart your browser completely!'
          ],
          note: '⚠️ Important: Linux TTS support varies by distribution and browser. Chrome/Chromium usually works best.',
          additionalTips: [
            '💡 For better quality, consider installing Festival voices',
            '💡 Some distributions use different package managers (yum, pacman, etc.)',
            '💡 Browser support for TTS on Linux is limited compared to Windows/Mac',
            '💡 You may need to install additional voice packages for better quality'
          ]
        };
      
      default:
        return {
          title: 'General Installation Instructions',
          icon: '💻',
          steps: [
            '1. Check your operating system settings for language/speech options',
            '2. Look for Text-to-Speech or Speech settings',
            '3. Download additional language packs',
            '4. Restart your browser after installation'
          ],
          note: '⚠️ Instructions may vary depending on your operating system and browser.',
          additionalTips: [
            '💡 Chrome and Edge typically have the best TTS support',
            '💡 Some browsers may require specific extensions'
          ]
        };
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  const getPlatformInfo = (platform: 'windows' | 'mac' | 'linux') => {
    switch (platform) {
      case 'windows':
        return { name: 'Windows', icon: '🪟', color: 'blue' };
      case 'mac':
        return { name: 'macOS', icon: '🍎', color: 'gray' };
      case 'linux':
        return { name: 'Linux', icon: '🐧', color: 'orange' };
      default:
        return { name: 'Unknown', icon: '💻', color: 'gray' };
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0: {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Improve Your Learning Experience</h3>
              <p className="text-gray-600">
                Get authentic pronunciation by installing native language voices. 
                This will make your language learning much more effective!
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What you'll get:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Native pronunciation for each language</li>
                <li>✅ Authentic accents and intonation</li>
                <li>✅ Better listening comprehension practice</li>
                <li>✅ More immersive learning experience</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Current Status:</h4>
              <p className="text-sm text-yellow-700">
                You currently have {window.speechSynthesis.getVoices().length} voices installed. 
                Platform detected: <strong>{detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}</strong>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Select Your Operating System:</h4>
              <div className="grid grid-cols-3 gap-3">
                {(['windows', 'mac', 'linux'] as const).map((platform) => {
                  const info = getPlatformInfo(platform);
                  const isDetected = platform === detectedPlatform;
                  const isSelected = platform === selectedPlatform;
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{info.icon}</div>
                        <div className="font-medium text-sm">{info.name}</div>
                        {isDetected && (
                          <div className="text-xs text-green-600 mt-1">Detected</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We detected <strong>{detectedPlatform}</strong>, but you can choose your actual OS above.
              </p>
            </div>
          </div>
        );
      }

      case 1: {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Select Languages to Install</h3>
              <p className="text-gray-600">Choose which languages you'd like to use in the app.</p>
              {selectedPlatform && (
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <span className="mr-1">{getPlatformInfo(selectedPlatform).icon}</span>
                  Installing for {getPlatformInfo(selectedPlatform).name}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Popular Languages */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">🌟 Recommended (Most Popular)</h4>
                <div className="grid grid-cols-1 gap-2">
                  {languageOptions.popular.map(lang => (
                    <label key={lang.code} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={() => handleLanguageToggle(lang.code)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{lang.name} ({lang.nativeName})</div>
                        <div className="text-sm text-gray-500">
                          {selectedPlatform ? lang[selectedPlatform] : 'Select OS above'}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        Popular
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Languages */}
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">📚 Additional Languages</h4>
                <div className="grid grid-cols-1 gap-2">
                  {languageOptions.other.map(lang => (
                    <label key={lang.code} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={() => handleLanguageToggle(lang.code)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{lang.name} ({lang.nativeName})</div>
                        <div className="text-sm text-gray-500">
                          {selectedPlatform ? lang[selectedPlatform] : 'Select OS above'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Start with 2-3 languages you're most interested in. 
                You can always add more later!
              </p>
            </div>
          </div>
        );
      }

      case 2: {
        if (!selectedPlatform) {
          return <div>Please select your operating system first.</div>;
        }

        const instructions = getInstructionsForPlatform(selectedPlatform);

        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">{instructions.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{instructions.title}</h3>
              <p className="text-gray-600">Follow these steps to install your selected language voices.</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">
                {instructions.note}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">📋 Step-by-Step Instructions:</h4>
              <ol className="text-sm text-gray-700 space-y-2">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2 min-w-0">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Helpful Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {instructions.additionalTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Your Selected Languages:</h4>
              <div className="space-y-2">
                {selectedLanguages.map(langCode => {
                  const lang = [...languageOptions.popular, ...languageOptions.other].find(l => l.code === langCode);
                  return (
                    <div key={langCode} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{lang?.name} ({lang?.nativeName})</span>
                      <span className="text-green-600 font-mono text-xs">
                        {lang && selectedPlatform ? lang[selectedPlatform] : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 3: {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Check Installation Status</h3>
              <p className="text-gray-600">
                After installing the languages, click "Check Now" to verify they're working.
              </p>
            </div>

            {needsBrowserRestart && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div>
                    <p className="text-red-800 font-medium">Browser Restart Required</p>
                    <p className="text-red-700 text-sm">
                      Some voices may not appear until you restart your browser. 
                      Close all browser windows and reopen them, then return to this page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {selectedLanguages.map(langCode => {
                const lang = [...languageOptions.popular, ...languageOptions.other].find(l => l.code === langCode);
                const status = installationProgress[langCode] || 'pending';
                
                return (
                  <div key={langCode} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{lang?.name} ({lang?.nativeName})</div>
                      <div className="text-sm text-gray-500">
                        {lang && selectedPlatform ? lang[selectedPlatform] : ''}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {status === 'pending' && (
                        <span className="text-gray-500 text-sm">Not checked</span>
                      )}
                      {status === 'checking' && (
                        <span className="text-blue-600 text-sm">Checking...</span>
                      )}
                      {status === 'found' && (
                        <span className="text-green-600 text-sm">✅ Installed</span>
                      )}
                      {status === 'missing' && (
                        <span className="text-red-600 text-sm">❌ Missing</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={checkVoiceAvailability}
                disabled={isChecking}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChecking ? 'Checking...' : 'Check Installation Status'}
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 After Installation:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Refresh this page to see the new voices</li>
                <li>• Try the speech features in vocabulary lessons</li>
                <li>• The voice status indicator will update automatically</li>
                <li>• You can test voices using the voice status panel</li>
              </ul>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎵</span>
            <h2 className="text-xl font-bold">Voice Installation Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of 4</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {getStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip for now
            </button>
          </div>
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 1 && selectedLanguages.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1 ? `Continue (${selectedLanguages.length} selected)` : 'Next'}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInstallationWizard;
