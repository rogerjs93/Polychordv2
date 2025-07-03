import React from 'react';
import { User2, RotateCcw, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Language } from '../types';

interface UserProfileProps {
  languages: Language[];
}

export const UserProfile: React.FC<UserProfileProps> = ({ languages }) => {
  const { user, resetUser } = useAuth();

  if (!user) return null;

  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to reset your profile? This will delete all your progress and cannot be undone.')) {
      resetUser();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
      </div>

      <div className="space-y-6">
        {/* User Info */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="flex items-center">
                <User2 className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{user.name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Language Pairs */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Language Pairs</h3>
          <div className="space-y-2">
            {user.languagePairs.map((pair) => {
              const nativeLang = languages.find(lang => lang.code === pair.nativeLanguage);
              const targetLang = languages.find(lang => lang.code === pair.targetLanguage);
              return (
                <div key={pair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{nativeLang?.flag}</span>
                    <span className="font-medium">{nativeLang?.nativeName}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-2xl mr-2">{targetLang?.flag}</span>
                    <span className="font-medium">{targetLang?.nativeName}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {pair.progress.wordsLearned} words learned
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{user.progress.totalWordsLearned}</div>
              <div className="text-sm text-gray-600">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.progress.currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{user.progress.longestStreak}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{user.progress.wordsLearnedToday}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Goal</label>
              <span className="text-gray-900">{user.progress.dailyGoal} words/day</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sound</label>
              <span className="text-gray-900">{user.preferences.soundEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <span className="text-gray-900 capitalize">{user.preferences.theme}</span>
            </div>
          </div>
        </div>

        {/* Reset Profile */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Reset Profile</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will permanently delete all your progress, achievements, and settings. This action cannot be undone.
          </p>
          <button
            onClick={handleResetProfile}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Profile
          </button>
        </div>
      </div>
    </div>
  );
};
