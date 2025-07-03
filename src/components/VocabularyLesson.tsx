import React, { useState, useEffect } from 'react';
import { Volume2, ArrowRight, CheckCircle, BookOpen, Target, ArrowLeft, Lock } from 'lucide-react';
import { Lesson } from '../types';
import { useSpeech } from '../hooks/useSpeech';

interface VocabularyLessonProps {
  lesson: Lesson;
  onSectionComplete: (wordsLearned: number) => void;
  onLessonComplete: (wordsInLesson: number) => void;
  targetLanguage: string;
  currentSectionIndex: number;
  onStartSection: (sectionIndex: number) => void;
}

export const VocabularyLesson: React.FC<VocabularyLessonProps> = ({
  lesson,
  onSectionComplete,
  onLessonComplete,
  targetLanguage,
  currentSectionIndex,
  onStartSection
}) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(currentSectionIndex);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const { speak, isSpeaking } = useSpeech();

  useEffect(() => {
    setActiveSectionIndex(currentSectionIndex);
    setCurrentWordIndex(0);
    setLessonCompleted(false); // Reset completion state when starting a new lesson
  }, [currentSectionIndex, lesson.id]);

  const currentSection = lesson.sections[activeSectionIndex];
  const currentWord = currentSection?.words[currentWordIndex];
  const totalSections = lesson.sections.length;
  const completedSectionsCount = lesson.sections.filter(s => s.completed).length;

  const handleSpeak = (text: string, isTargetLanguage: boolean = true) => {
    const langCode = isTargetLanguage 
      ? (targetLanguage === 'es' ? 'es-ES' : 
         targetLanguage === 'fr' ? 'fr-FR' : 
         targetLanguage === 'de' ? 'de-DE' :
         targetLanguage === 'fi' ? 'fi-FI' : 
         targetLanguage === 'it' ? 'it-IT' :
         targetLanguage === 'pt' ? 'pt-PT' :
         targetLanguage === 'ru' ? 'ru-RU' :
         targetLanguage === 'ja' ? 'ja-JP' :
         targetLanguage === 'ko' ? 'ko-KR' :
         targetLanguage === 'zh' ? 'zh-CN' : 'en-US')
      : 'en-US'; // Native language (assuming English for examples)
    
    speak(text, langCode);
  };

  const handleNextWord = () => {
    if (!currentSection || lessonCompleted) return;

    // Mark current word as seen
    if (currentWord) {
      setCompletedWords(prev => new Set([...prev, currentWord.id]));
    }

    if (currentWordIndex < currentSection.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Section completed
      handleSectionComplete();
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const handleSectionComplete = () => {
    if (!currentSection || lessonCompleted) return;

    // Report progress first
    onSectionComplete(currentSection.words.length);

    // Check if this was the last section
    if (activeSectionIndex === lesson.sections.length - 1) {
      // This was the last section, so the lesson is complete
      setLessonCompleted(true);
      onLessonComplete(lesson.totalWords);
    } else {
      // Move to next section automatically
      setTimeout(() => {
        onStartSection(activeSectionIndex + 1);
      }, 100);
    }
  };

  const handleSectionSelect = (sectionIndex: number) => {
    if (!lesson.sections[sectionIndex].isLocked) {
      onStartSection(sectionIndex);
    }
  };

  if (!currentSection || !currentWord) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{lesson.title}</h2>
              <p className="text-indigo-100">Section {activeSectionIndex + 1} of {totalSections}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{completedSectionsCount}/{totalSections}</div>
            <div className="text-sm text-indigo-100">Sections Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedSectionsCount / totalSections) * 100}%` }}
          ></div>
        </div>

        {/* Section Progress */}
        <div className="flex items-center justify-between text-sm text-indigo-100">
          <span>Word {currentWordIndex + 1} of {currentSection.words.length}</span>
          <span>{currentSection.words.length} words in this section</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Sections
            </h3>
            
            <div className="space-y-2">
              {lesson.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(index)}
                  disabled={section.isLocked}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    index === activeSectionIndex
                      ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-700'
                      : section.completed
                      ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                      : section.isLocked
                      ? 'bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{section.title.split(' - ').slice(-1)}</span>
                    {section.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : section.isLocked ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : null}
                  </div>
                  <div className="text-sm opacity-75">
                    {section.words.length} words
                  </div>
                </button>
              ))}
            </div>

            {/* Section Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-600">{activeSectionIndex + 1}</div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-emerald-600">{completedWords.size}</div>
                  <div className="text-xs text-gray-500">Seen</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Word Card */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              {/* Word Display */}
              <div className="mb-6">
                <h3 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h3>
                <p className="text-lg text-gray-500 mb-4">{currentWord.pronunciation}</p>
                
                <button
                  onClick={() => handleSpeak(currentWord.word, false)} // Native language
                  disabled={isSpeaking}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  <Volume2 className="w-5 h-5" />
                  {isSpeaking ? 'Playing...' : 'Listen'}
                </button>
              </div>

              {/* Translation Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
                    <h4 className="text-2xl font-bold text-emerald-700 mb-2">{currentWord.translation}</h4>
                    <button
                      onClick={() => handleSpeak(currentWord.translation, true)} // Target language
                      disabled={isSpeaking}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50 text-sm"
                    >
                      <Volume2 className="w-4 h-4" />
                      Listen
                    </button>
                  </div>

                  {/* Example Usage */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Example Usage:</h5>
                    
                    {/* Native Language Example */}
                    <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-800 mb-2">{currentWord.example}</p>
                      <button
                        onClick={() => handleSpeak(currentWord.example, false)} // Native language
                        disabled={isSpeaking}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        Listen to example
                      </button>
                    </div>

                    {/* Translated Example */}
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-emerald-800 italic mb-2">{currentWord.exampleTranslation}</p>
                      <button
                        onClick={() => handleSpeak(currentWord.exampleTranslation, true)} // Target language
                        disabled={isSpeaking}
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        Listen to translation
                      </button>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      <Target className="w-3 h-3" />
                      {currentWord.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousWord}
              disabled={currentWordIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Word
            </button>

            <div className="flex items-center gap-4">
              {/* Word Progress Dots */}
              <div className="flex items-center gap-1">
                {currentSection.words.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index < currentWordIndex
                        ? 'bg-emerald-500'
                        : index === currentWordIndex
                        ? 'bg-indigo-500 w-3 h-3'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {lessonCompleted ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                <CheckCircle className="w-5 h-5" />
                Lesson Completed! Redirecting...
              </div>
            ) : currentWordIndex === currentSection.words.length - 1 ? (
              <button
                onClick={handleSectionComplete}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Section
              </button>
            ) : (
              <button
                onClick={handleNextWord}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next Word
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};