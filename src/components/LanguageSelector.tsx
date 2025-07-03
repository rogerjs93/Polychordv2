import React from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { Language, LanguagePair } from '../types';

interface LanguageSelectorProps {
  languages: Language[];
  languagePairs: LanguagePair[];
  currentPairId?: string;
  onLanguagePairChange: (pairId: string) => void;
  onManageLanguages: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  languagePairs,
  currentPairId,
  onLanguagePairChange,
  onManageLanguages
}) => {
  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.nativeName}` : code;
  };

  const currentPair = languagePairs.find(pair => pair.id === currentPairId);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <select
          value={currentPairId || ''}
          onChange={(e) => onLanguagePairChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
        >
          {languagePairs.map((pair) => (
            <option key={pair.id} value={pair.id}>
              {getLanguageName(pair.nativeLanguage)} → {getLanguageName(pair.targetLanguage)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <button
        onClick={onManageLanguages}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Manage Languages"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">Manage</span>
      </button>

      {currentPair && (
        <div className="text-sm text-gray-500">
          Level: <span className="capitalize font-medium">{currentPair.progress.currentLevel}</span>
        </div>
      )}
    </div>
  );
};