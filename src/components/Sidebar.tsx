import React from 'react';
import { BookOpen, Gamepad2, Trophy, TrendingUp, Plus, ChevronDown, Globe2, Star, Award, User2 } from 'lucide-react';
import { Language, User as UserType, LanguagePair } from '../types';
import { useTranslation } from '../hooks/useTranslation';

type ViewType = 'dashboard' | 'learn' | 'games' | 'progress' | 'profile';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  languages: Language[];
  user: UserType;
  currentLanguagePair: LanguagePair | null;
  onLanguagePairChange: (pairId: string) => void;
  onManageLanguages: () => void;
  onGameSelect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  languages,
  user,
  currentLanguagePair,
  onLanguagePairChange,
  onManageLanguages,
  onGameSelect
}) => {
  const { t } = useTranslation();

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.nativeName}` : code;
  };

  const getLanguageFlag = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang?.flag || '🌐';
  };

  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: TrendingUp, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'learn', label: t('learn'), icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'games', label: t('games'), icon: Gamepad2, gradient: 'from-purple-500 to-pink-600' },
    { id: 'progress', label: t('progress'), icon: Trophy, gradient: 'from-amber-500 to-orange-600' },
    { id: 'profile', label: 'Profile', icon: User2, gradient: 'from-rose-500 to-pink-600' },
  ];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">{t('manageLanguages')}</h2>
            <p className="text-sm text-gray-500">Choose your learning path</p>
          </div>
        </div>

        {/* Current Language Pair Display */}
        {currentLanguagePair && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Currently Learning</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-500 capitalize">{currentLanguagePair.progress.currentLevel}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getLanguageFlag(currentLanguagePair.nativeLanguage)}</span>
              <div className="flex-1 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full relative">
                <div className="absolute inset-y-0 right-0 w-2 h-2 bg-white rounded-full transform translate-x-1 -translate-y-0.5 border-2 border-indigo-500"></div>
              </div>
              <span className="text-2xl">{getLanguageFlag(currentLanguagePair.targetLanguage)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {languages.find(l => l.code === currentLanguagePair.nativeLanguage)?.nativeName}
              </span>
              <span className="font-medium text-indigo-600">
                {languages.find(l => l.code === currentLanguagePair.targetLanguage)?.nativeName}
              </span>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{currentLanguagePair.progress.wordsLearned} words learned</span>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>{currentLanguagePair.progress.lessonsCompleted} lessons</span>
              </div>
            </div>
          </div>
        )}

        {/* Language Pair Selector */}
        <div className="space-y-3">
          <div className="relative">
            <select
              value={currentLanguagePair?.id || ''}
              onChange={(e) => onLanguagePairChange(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
            >
              {user.languagePairs.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {getLanguageName(pair.nativeLanguage)} → {getLanguageName(pair.targetLanguage)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={onManageLanguages}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Language Pair
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</h3>
          
          {navigationItems.map(({ id, label, icon: Icon, gradient }) => (
            <button
              key={id}
              onClick={() => {
                onViewChange(id as ViewType);
                if (id === 'games') {
                  onGameSelect();
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                currentView === id
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg transform scale-[1.02]`
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                currentView === id
                  ? 'bg-white/20'
                  : `bg-gradient-to-r ${gradient} text-white group-hover:scale-110`
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-medium">{label}</span>
              {currentView === id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 border-t border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Quick Stats
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{user.progress.currentStreak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">{user.progress.totalWordsLearned}</div>
              <div className="text-xs text-gray-500">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{user.languagePairs.length}</div>
              <div className="text-xs text-gray-500">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">{user.progress.wordsLearnedToday}</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};