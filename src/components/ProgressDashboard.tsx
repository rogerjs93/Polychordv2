import React from 'react';
import { Target, Trophy, Flame, TrendingUp } from 'lucide-react';
import { UserProgress } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ProgressDashboardProps {
  progress: UserProgress;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress }) => {
  const { t } = useTranslation();
  const progressPercentage = Math.min((progress.wordsLearnedToday / progress.dailyGoal) * 100, 100);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('yourProgress')}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg p-4">
          <Flame className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{progress.currentStreak}</p>
          <p className="text-sm opacity-90">{t('dayStreak')}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg p-4">
          <Target className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{progress.wordsLearnedToday}</p>
          <p className="text-sm opacity-90">{t('wordsToday')}</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-lg p-4">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{progress.totalWordsLearned}</p>
          <p className="text-sm opacity-90">{t('totalWords')}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg p-4">
          <Trophy className="w-8 h-8 mb-2" />
          <p className="text-2xl font-bold">{progress.longestStreak}</p>
          <p className="text-sm opacity-90">{t('bestStreak')}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{t('dailyGoalProgress')}</span>
          <span className="text-sm text-gray-500">{progress.wordsLearnedToday}/{progress.dailyGoal}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        <div className="text-center text-xs text-gray-500 col-span-7 mb-2">{t('weeklyActivity')}</div>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayProgress = progress.weeklyProgress.find(p => p.date === date.toISOString().split('T')[0]);
          const wordsLearned = dayProgress?.wordsLearned || 0;
          
          return (
            <div
              key={i}
              className={`h-8 rounded ${
                wordsLearned > 0 
                  ? wordsLearned >= progress.dailyGoal 
                    ? 'bg-emerald-500' 
                    : 'bg-emerald-300'
                  : 'bg-gray-200'
              }`}
              title={`${date.toLocaleDateString()}: ${wordsLearned} words`}
            />
          );
        })}
      </div>
    </div>
  );
};