import React, { useState } from 'react';
import { useOpenSourceTTS } from '../hooks/useOpenSourceTTS';

interface VoiceOptionsManagerProps {
  onClose: () => void;
}

const VoiceOptionsManager: React.FC<VoiceOptionsManagerProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'system' | 'opensource' | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['VoiceRSS', 'eSpeak']);
  const [initializationProgress, setInitializationProgress] = useState<{[key: string]: 'pending' | 'loading' | 'success' | 'failed'}>({});
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const openSourceTTS = useOpenSourceTTS();

  const voiceOptions = [
    {
      id: 'system',
      title: '🖥️ System Voices',
      subtitle: 'Install native language packs',
      description: 'Install language packs directly on your computer for the highest quality voices',
      quality: 'Excellent',
      setup: '15-30 minutes',
      internet: 'Only for setup',
      pros: [
        'Highest quality voices with perfect pronunciation',
        'Works offline once installed',
        'No usage limits or restrictions',
        'Integrates seamlessly with your OS'
      ],
      cons: [
        'Requires system installation permissions',
        'Takes longer to set up',
        'Different process for each OS',
        'May need system restart'
      ],
      bestFor: 'Users who want the best possible voice quality and don\'t mind spending time on setup',
      recommended: true
    },
    {
      id: 'opensource',
      title: '🌐 Online Voices',
      subtitle: 'Use free web-based voices',
      description: 'Get good quality voices instantly through free online services',
      quality: 'Good',
      setup: '30 seconds',
      internet: 'Required for use',
      pros: [
        'Instant setup - works immediately',
        'No system installation needed',
        'Works on any device or browser',
        'Multiple backup options available'
      ],
      cons: [
        'Requires internet connection',
        'Slightly lower quality than system voices',
        'May have usage limits',
        'Depends on external services'
      ],
      bestFor: 'Users who want to start learning immediately without system setup',
      recommended: false
    }
  ];

  const providers = [
    {
      name: 'VoiceRSS',
      description: 'Professional TTS service with high-quality voices',
      quality: 'Good',
      languages: 15,
      setup: 'Instant',
      pros: ['High quality', 'No ads', 'Stable', 'Reliable'],
      cons: ['Internet required', 'Daily limits'],
      recommended: true
    },
    {
      name: 'eSpeak',
      description: 'Open-source offline TTS (works without internet)',
      quality: 'Basic',
      languages: 15,
      setup: 'Quick download',
      pros: ['Works offline', 'No limits', 'Private', 'Always available'],
      cons: ['Robotic voice', 'Lower quality'],
      recommended: true
    },
    {
      name: 'ResponsiveVoice',
      description: 'Web-based TTS with natural voices (experimental)',
      quality: 'Good',
      languages: 15,
      setup: 'Instant',
      pros: ['Natural voices', 'Easy to use'],
      cons: ['Internet required', 'May have loading issues', 'Rate limits'],
      recommended: false
    }
  ];

  const handleProviderToggle = (providerName: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerName)
        ? prev.filter(name => name !== providerName)
        : [...prev, providerName]
    );
  };

  const initializeProviders = async () => {
    const progress: {[key: string]: 'pending' | 'loading' | 'success' | 'failed'} = {};
    
    // Initialize progress state
    selectedProviders.forEach(provider => {
      progress[provider] = 'pending';
    });
    setInitializationProgress(progress);

    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    setIsInitializing(true); // Set initializing state to true

    // Initialize each provider
    for (const providerName of selectedProviders) {
      progress[providerName] = 'loading';
      setInitializationProgress({...progress});
      
      try {
        console.log(`🔄 Initializing ${providerName}...`);
        const success = await openSourceTTS.initializeProvider(providerName);
        
        if (success) {
          console.log(`✅ ${providerName} initialized successfully`);
          progress[providerName] = 'success';
        } else {
          console.warn(`❌ ${providerName} initialization failed`);
          progress[providerName] = 'failed';
        }
        
        setInitializationProgress({...progress});
        
        // Add a delay between providers to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to initialize ${providerName}:`, err);
        progress[providerName] = 'failed';
        setInitializationProgress({...progress});
      }
    }
    
    setIsInitializing(false); // Reset initializing state
    setInitializationComplete(true); // Set completion state to true
    
    // Show completion message
    const successCount = Object.values(progress).filter(status => status === 'success').length;
    const totalCount = selectedProviders.length;
    
    console.log(`🎉 Provider initialization complete: ${successCount}/${totalCount} successful`);
  };

  const testProvider = async (providerName: string) => {
    const success = await openSourceTTS.speak('Hello world', 'en', providerName);
    console.log(`Test result for ${providerName}:`, success);
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Choose Your Voice Setup</h3>
              <p className="text-gray-600">
                Select the option that works best for you. Both provide great pronunciation for language learning.
              </p>
            </div>

            <div className="space-y-4">
              {voiceOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${option.recommended ? 'ring-2 ring-green-200' : ''}`}
                  onClick={() => setSelectedOption(option.id as 'system' | 'opensource')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id as 'system' | 'opensource')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-lg">{option.title}</h4>
                          {option.recommended && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{option.subtitle}</p>
                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Quality:</span>
                      <span className={`ml-1 ${option.quality === 'Excellent' ? 'text-green-600' : 'text-blue-600'}`}>
                        {option.quality}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Setup:</span>
                      <span className="ml-1 text-gray-600">{option.setup}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Internet:</span>
                      <span className="ml-1 text-gray-600">{option.internet}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">✅ Pros:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {option.pros.map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">⚠️ Cons:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {option.cons.map((con, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">👥 Best for:</span> {option.bestFor}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Not sure which to choose?</h4>
              <p className="text-sm text-blue-700">
                <strong>System Voices</strong> give you the best quality but take longer to set up.
                <strong> Online Voices</strong> let you start learning immediately with good quality.
                You can always switch later!
              </p>
            </div>
          </div>
        );

      case 1:
        if (selectedOption === 'system') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">🖥️ System Voice Installation</h3>
                <p className="text-gray-600">
                  You'll be redirected to the system installation wizard to set up native language voices.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">What happens next:</h4>
                <ol className="text-sm text-green-700 space-y-1">
                  <li>1. Choose your operating system</li>
                  <li>2. Select languages to install</li>
                  <li>3. Follow step-by-step installation guide</li>
                  <li>4. Test your new voices</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⏱️ Time needed:</strong> 15-30 minutes including downloads<br/>
                  <strong>💾 Storage:</strong> 50-200MB per language<br/>
                  <strong>🔒 Permissions:</strong> May require admin access
                </p>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">🌐 Online Voice Setup</h3>
                <p className="text-gray-600">
                  Choose which online voice services you'd like to use. We recommend selecting multiple for best reliability.
                </p>
              </div>

              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.name}
                    className={`border rounded-lg p-4 ${
                      selectedProviders.includes(provider.name) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${provider.recommended ? 'ring-2 ring-green-200' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(provider.name)}
                          onChange={() => handleProviderToggle(provider.name)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{provider.name}</h4>
                            {provider.recommended && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{provider.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-500">🎵 {provider.quality}</span>
                            <span className="text-gray-500">🌍 {provider.languages} languages</span>
                            <span className="text-gray-500">⚡ {provider.setup}</span>
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-green-700">✅ Pros:</span>
                              <ul className="text-green-600 mt-1">
                                {provider.pros.map((pro, index) => (
                                  <li key={index}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-orange-700">⚠️ Cons:</span>
                              <ul className="text-orange-600 mt-1">
                                {provider.cons.map((con, index) => (
                                  <li key={index}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {initializationProgress[provider.name] === 'success' && (
                          <div className="flex items-center space-x-1">
                            <span className="text-green-600 text-sm">✅ Ready</span>
                            <button
                              onClick={() => testProvider(provider.name)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                            >
                              Test
                            </button>
                          </div>
                        )}
                        {initializationProgress[provider.name] === 'failed' && (
                          <div className="flex items-center space-x-1">
                            <span className="text-red-600 text-sm">❌ Failed</span>
                            <button
                              onClick={() => openSourceTTS.initializeProvider(provider.name)}
                              className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                        {initializationProgress[provider.name] === 'loading' && (
                          <div className="flex items-center space-x-1">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-blue-600 text-sm">Loading...</span>
                          </div>
                        )}
                        {initializationProgress[provider.name] === 'pending' && selectedProviders.includes(provider.name) && (
                          <span className="text-gray-500 text-sm">⏳ Waiting...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Quick Setup Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• VoiceRSS + eSpeak work great together (recommended)</li>
                  <li>• VoiceRSS provides high quality for online use</li>
                  <li>• eSpeak works offline and has no limits</li>
                  <li>• ResponsiveVoice may have loading issues</li>
                  <li>• Setup takes about 30 seconds</li>
                </ul>
              </div>

              {initializationComplete && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">🎉 Setup Complete!</h4>
                  <div className="text-sm text-green-700">
                    {(() => {
                      const successCount = Object.values(initializationProgress).filter(status => status === 'success').length;
                      const failedCount = Object.values(initializationProgress).filter(status => status === 'failed').length;
                      
                      if (successCount > 0) {
                        return (
                          <div>
                            <p>✅ Successfully initialized {successCount} voice provider{successCount !== 1 ? 's' : ''}!</p>
                            {failedCount > 0 && (
                              <p className="mt-1">⚠️ {failedCount} provider{failedCount !== 1 ? 's' : ''} failed to load (this is normal - you have working alternatives).</p>
                            )}
                            <p className="mt-2 font-medium">🎵 You can now use online voices for all languages!</p>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <p>❌ All providers failed to initialize.</p>
                            <p className="mt-1">💡 Try system voice installation instead, or check your internet connection.</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎵</span>
            <h2 className="text-xl font-bold">Voice Setup Options</h2>
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
            <span className="text-sm text-gray-600">Step {currentStep + 1} of 2</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / 2) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / 2) * 100}%` }}
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
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
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
            
            {currentStep === 0 && (
              <button
                onClick={() => setCurrentStep(1)}
                disabled={!selectedOption}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
            
            {currentStep === 1 && selectedOption === 'system' && (
              <button
                onClick={() => {
                  onClose();
                  // This will be handled by the parent component to show the system wizard
                  window.dispatchEvent(new CustomEvent('openSystemVoiceWizard'));
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Open System Installation
              </button>
            )}
            
            {currentStep === 1 && selectedOption === 'opensource' && (
              <div className="flex space-x-2">
                {!initializationComplete ? (
                  <button
                    onClick={initializeProviders}
                    disabled={selectedProviders.length === 0 || isInitializing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isInitializing && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {isInitializing 
                        ? 'Setting up...' 
                        : `Setup ${selectedProviders.length} Provider${selectedProviders.length !== 1 ? 's' : ''}`}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    🎉 Start Learning!
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceOptionsManager;
