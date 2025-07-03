import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { UserSetup } from './components/UserSetup';
import { UserProfile } from './components/UserProfile';
import { Header } from './components/Header';
import { ProgressDashboard } from './components/ProgressDashboard';
import { VocabularyLesson } from './components/VocabularyLesson';
import { LessonSelector } from './components/LessonSelector';
import { GameContainer } from './components/GameContainer';
import { LanguageManager } from './components/LanguageManager';
import { Sidebar } from './components/Sidebar';
import { Gamepad2 } from 'lucide-react';
import { Language, GameScore } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTranslation } from './hooks/useTranslation';
import { useVocabulary } from './hooks/useVocabulary';

// Import data
import languagesData from './data/languages.json';

type ViewType = 'dashboard' | 'learn' | 'games' | 'progress' | 'profile';
type GameType = 'matching' | 'memory' | 'typing' | 'listening' | 'puzzle' | 'quiz' | null;

const AppContent: React.FC = () => {
  const { user, updateDailyProgress, getCurrentLanguagePair, setCurrentLanguagePair, createUser } = useAuth();
  const { t } = useTranslation();
  const [languages] = useState<Language[]>(languagesData);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [gameScores, setGameScores] = useLocalStorage<GameScore[]>('game_scores', []);
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [showLanguageManager, setShowLanguageManager] = useState(false);
  const [showLessonSelector, setShowLessonSelector] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useLocalStorage<Set<string>>('completed_sections', new Set());
  const [completedLessons, setCompletedLessons] = useLocalStorage<Set<string>>('completed_lessons', new Set());
  const [lessonStats, setLessonStats] = useLocalStorage('lesson_stats', {
    sectionsCompleted: 0,
    lessonsCompleted: 0,
    totalWordsLearned: 0
  });

  const currentLanguagePair = getCurrentLanguagePair();
  
  // Use the vocabulary hook to automatically load vocabulary based on language pair
  const { 
    vocabulary, 
    loading: vocabularyLoading, 
    error: vocabularyError, 
    refreshVocabulary,
    getWordsForGames,
    getCurrentLessonWords
  } = useVocabulary(
    currentLanguagePair?.nativeLanguage || '',
    currentLanguagePair?.targetLanguage || ''
  );

  const handleSectionComplete = (wordsLearned: number) => {
    // Update lesson stats
    setLessonStats(prev => ({
      ...prev,
      sectionsCompleted: prev.sectionsCompleted + 1,
      totalWordsLearned: prev.totalWordsLearned + wordsLearned
    }));

    // Mark section as completed
    const sectionId = `section-${currentSectionIndex}`;
    setCompletedSections(prev => new Set([...prev, sectionId]));

    // Update user progress for each word learned
    for (let i = 0; i < wordsLearned; i++) {
      updateDailyProgress();
    }
  };

  const handleLessonComplete = (wordsInLesson: number) => {
    setLessonStats(prev => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1
    }));
    
    // Mark lesson as completed
    const lessonId = `lesson-${currentLessonIndex}`;
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    
    // Show completion message and return to lesson selector
    alert(`🎉 Lesson completed! You've learned ${wordsInLesson} new words!`);
    setShowLessonSelector(true);
  };

  const handleStartLesson = (lessonIndex: number, sectionIndex: number) => {
    setCurrentLessonIndex(lessonIndex);
    setCurrentSectionIndex(sectionIndex);
    setShowLessonSelector(false);
  };

  const handleStartSection = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setShowLessonSelector(false);
  };

  const handleGameComplete = (score: number, accuracy: number) => {
    if (!currentLanguagePair) return;
    
    const newScore: GameScore = {
      gameType: selectedGame || 'matching',
      score,
      accuracy,
      timeSpent: 0,
      date: new Date().toISOString(),
      languagePair: currentLanguagePair.id
    };
    setGameScores([...gameScores, newScore]);
    setSelectedGame(null);
  };

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
  };

  const handleBackToGameSelection = () => {
    setSelectedGame(null);
  };

  const handleLanguagePairChange = (pairId: string) => {
    setCurrentLanguagePair(pairId);
  };

  const handleUserSetup = (name: string, nativeLanguage: string, targetLanguage: string) => {
    createUser(name, nativeLanguage, targetLanguage);
  };

  if (!user) {
    return <UserSetup languages={languages} onSetupComplete={handleUserSetup} />;
  }

  if (!currentLanguagePair) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Setting up your languages...</h2>
          <p className="text-gray-600">Please wait while we configure your language pairs.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2">{t('welcome')}, {user.name}!</h2>
              <p className="text-indigo-100 mb-2">
                {t('currentlyLearning')}: {languages.find(l => l.code === currentLanguagePair.targetLanguage)?.nativeName}
              </p>
              <p className="text-indigo-100">{t('readyToContinue')}</p>
            </div>
            <ProgressDashboard progress={user.progress} />
            
            {/* Lesson Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Learning Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{lessonStats.sectionsCompleted}</div>
                  <div className="text-sm text-gray-600">Sections Completed</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{lessonStats.lessonsCompleted}</div>
                  <div className="text-sm text-gray-600">Lessons Completed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{lessonStats.totalWordsLearned}</div>
                  <div className="text-sm text-gray-600">Words from Lessons</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'learn':
        if (showLessonSelector) {
          return (
            <LessonSelector
              vocabulary={vocabulary}
              onStartLesson={handleStartLesson}
              onStartSection={handleStartSection}
              completedSections={completedSections}
              completedLessons={completedLessons}
            />
          );
        }

        return (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('learnVocabulary')}</h2>
              
              {vocabularyLoading ? (
                <p className="text-gray-600">Loading vocabulary...</p>
              ) : vocabularyError ? (
                <div className="text-center py-4">
                  <p className="text-red-600 mb-2">{vocabularyError}</p>
                  <button
                    onClick={refreshVocabulary}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <p className="text-gray-600">
                    {vocabulary.length > 0 ? `${vocabulary.length} words available for learning` : 'No vocabulary available'}
                  </p>
                  <button
                    onClick={() => setShowLessonSelector(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Choose Lesson
                  </button>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                {t('learning')}: {languages.find(l => l.code === currentLanguagePair.nativeLanguage)?.flag} → {languages.find(l => l.code === currentLanguagePair.targetLanguage)?.flag}
              </p>
            </div>
            
            {!vocabularyLoading && !vocabularyError && vocabulary.length > 0 ? (
              <VocabularyLesson
                vocabulary={getCurrentLessonWords(currentLessonIndex, currentSectionIndex)}
                onSectionComplete={handleSectionComplete}
                onLessonComplete={handleLessonComplete}
                targetLanguage={currentLanguagePair.targetLanguage}
                currentSectionIndex={currentSectionIndex}
              />
            ) : !vocabularyLoading && !vocabularyError ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No vocabulary available for this language pair yet.</p>
                <p className="text-sm text-gray-400 mt-2">More content coming soon!</p>
                <button
                  onClick={refreshVocabulary}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            ) : null}
          </div>
        );
      
      case 'games':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('miniGames')}</h2>
              <p className="text-gray-600">{t('practiceWithGames')}</p>
              <p className="text-sm text-gray-500">
                {t('playing')}: {languages.find(l => l.code === currentLanguagePair.nativeLanguage)?.flag} → {languages.find(l => l.code === currentLanguagePair.targetLanguage)?.flag}
              </p>
              
              {vocabularyError && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-800 text-sm">{vocabularyError}</p>
                </div>
              )}

              {/* Smart Game Context Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  🎯 Games now use words from your current lesson progress for better learning continuity!
                </p>
              </div>
            </div>
            
            {!selectedGame ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Word Matching Game */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">{t('wordMatching')}</h3>
                  <p className="text-gray-600 mb-4 text-center">{t('wordMatchingDesc')}</p>
                  <button
                    onClick={() => handleGameSelect('matching')}
                    disabled={vocabularyLoading || vocabulary.length === 0}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vocabularyLoading ? 'Loading...' : t('playWordMatching')}
                  </button>
                </div>
                
                {/* Memory Game */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">{t('memoryGame')}</h3>
                  <p className="text-gray-600 mb-4 text-center">{t('memoryGameDesc')}</p>
                  <button
                    onClick={() => handleGameSelect('memory')}
                    disabled={vocabularyLoading || vocabulary.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vocabularyLoading ? 'Loading...' : t('playMemoryGame')}
                  </button>
                </div>

                {/* NEW: Typing Game */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Type Translation</h3>
                  <p className="text-gray-600 mb-4 text-center">Type the correct translation as fast as you can!</p>
                  <button
                    onClick={() => handleGameSelect('typing')}
                    disabled={vocabularyLoading || vocabulary.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vocabularyLoading ? 'Loading...' : 'Play Typing Game'}
                  </button>
                </div>

                {/* NEW: Listening Game */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Listen & Choose</h3>
                  <p className="text-gray-600 mb-4 text-center">Listen to words and choose the correct translation!</p>
                  <button
                    onClick={() => handleGameSelect('listening')}
                    disabled={vocabularyLoading || vocabulary.length === 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vocabularyLoading ? 'Loading...' : 'Play Listening Game'}
                  </button>
                </div>

                {/* NEW: Puzzle Game */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Word Puzzle</h3>
                  <p className="text-gray-600 mb-4 text-center">Unscramble letters to form the correct translation!</p>
                  <button
                    onClick={() => handleGameSelect('puzzle')}
                    disabled={vocabularyLoading || vocabulary.length === 0}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vocabularyLoading ? 'Loading...' : 'Play Puzzle Game'}
                  </button>
                </div>

                {/* NEW: Quiz Game */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">Quick Quiz</h3>
                  <p className="text-gray-600 mb-4 text-center">Fast-paced quiz with time pressure. Beat the clock!</p>
                  <button
                    onClick={() => handleGameSelect('quiz')}
                    disabled={vocabularyLoading || vocabulary.length === 0}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vocabularyLoading ? 'Loading...' : 'Play Quick Quiz'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToGameSelection}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ← {t('backToGames')}
                  </button>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedGame === 'matching' ? 'Word Matching Game' : 
                     selectedGame === 'memory' ? 'Memory Game' :
                     selectedGame === 'typing' ? 'Type Translation Game' :
                     selectedGame === 'listening' ? 'Listen & Choose Game' :
                     selectedGame === 'puzzle' ? 'Word Puzzle Game' :
                     selectedGame === 'quiz' ? 'Quick Quiz Game' : 'Mini Game'}
                  </h3>
                  <div></div>
                </div>
                
                {vocabulary.length > 0 ? (
                  <GameContainer
                    gameType={selectedGame}
                    vocabulary={getWordsForGames(selectedGame, currentLessonIndex, currentSectionIndex)}
                    onGameComplete={handleGameComplete}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No vocabulary available for games in this language pair.</p>
                    <button
                      onClick={refreshVocabulary}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Refresh Vocabulary
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'progress': {
        const currentPairScores = gameScores.filter(score => score.languagePair === currentLanguagePair.id);
        
        return (
          <div className="space-y-6">
            <ProgressDashboard progress={user.progress} />
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{t('recentGameScores')}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t('showingScoresFor')}: {languages.find(l => l.code === currentLanguagePair.nativeLanguage)?.flag} → {languages.find(l => l.code === currentLanguagePair.targetLanguage)?.flag}
              </p>
              
              {currentPairScores.length > 0 ? (
                <div className="space-y-3">
                  {currentPairScores.slice(-5).reverse().map((score, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium capitalize">{score.gameType.replace('-', ' ')}</span>
                        <div className="text-sm text-gray-500">
                          {new Date(score.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">{score.score} points</div>
                        <div className="text-sm text-gray-500">{score.accuracy.toFixed(1)}% accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('noGamesPlayed')}</p>
              )}
            </div>

            {/* Language Pair Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">{t('languageProgress')}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {user.languagePairs.map((pair) => {
                  const nativeLang = languages.find(l => l.code === pair.nativeLanguage);
                  const targetLang = languages.find(l => l.code === pair.targetLanguage);
                  const pairScores = gameScores.filter(score => score.languagePair === pair.id);
                  
                  return (
                    <div
                      key={pair.id}
                      className={`p-4 rounded-lg border-2 ${
                        pair.id === currentLanguagePair.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span>{nativeLang?.flag}</span>
                        <span className="text-gray-400">→</span>
                        <span>{targetLang?.flag}</span>
                        <span className="text-sm font-medium">{targetLang?.nativeName}</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('wordsLearned')}:</span>
                          <span className="font-medium">{pair.progress.wordsLearned}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('gamesPlayed')}:</span>
                          <span className="font-medium">{pairScores.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('level')}:</span>
                          <span className="font-medium capitalize">{pair.progress.currentLevel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      
      case 'profile':
        return <UserProfile languages={languages} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          languages={languages}
          user={user}
          currentLanguagePair={currentLanguagePair}
          onLanguagePairChange={handleLanguagePairChange}
          onManageLanguages={() => setShowLanguageManager(true)}
          onGameSelect={() => setSelectedGame(null)}
        />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
      
      {showLanguageManager && (
        <LanguageManager
          languages={languages}
          onClose={() => setShowLanguageManager(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;