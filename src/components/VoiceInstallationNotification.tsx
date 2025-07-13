import React, { useState } from 'react';
import { Download, X, Volume2 } from 'lucide-react';
import { useVoiceInstallationPrompt } from '../hooks/useVoiceInstallationPrompt';
import VoiceInstallationWizard from './VoiceInstallationWizard';

const VoiceInstallationNotification: React.FC = () => {
  const { shouldShowPrompt, markAsPrompted, dismissPrompt } = useVoiceInstallationPrompt();
  const [showWizard, setShowWizard] = useState(false);

  if (!shouldShowPrompt) return null;

  const handleOpenWizard = () => {
    setShowWizard(true);
    markAsPrompted();
  };

  const handleDismiss = () => {
    dismissPrompt();
    markAsPrompted();
  };

  return (
    <>
      <div className="fixed top-4 right-4 max-w-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-4 z-40 animate-slide-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">🎵 Enhance Your Pronunciation</h3>
            <p className="text-xs text-blue-100 mb-3">
              Install native language voices for authentic pronunciation and better learning results.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleOpenWizard}
                className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                <Download className="w-3 h-3" />
                Install Voices
              </button>
              <button
                onClick={handleDismiss}
                className="text-blue-100 hover:text-white px-2 py-1.5 text-xs transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-100 hover:text-white p-1 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showWizard && (
        <VoiceInstallationWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  );
};

export default VoiceInstallationNotification;
