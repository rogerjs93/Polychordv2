import React, { useState, useMemo } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Filter, Search, Grid, List, ArrowRight, Target, Award, Lock } from 'lucide-react';
import { Lesson } from '../types';

interface LessonSelectorProps {
  lessons: Lesson[];
  categories: string[];
  onStartLesson: (lessonIndex: number, sectionIndex: number) => void;
  onContinueLearning: () => void;
  firstUncompletedLessonIndex: number;
}

/**
 * LessonSelector Component
 * 
 * Displays all available lessons with full access - no lessons are locked.
 * Features:
 * - "Continue Learning" button guides users to their next uncompleted lesson
 * - All lessons and sections are accessible regardless of completion status
 * - Users have complete freedom to choose any lesson at any time
 */
export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  categories,
  onStartLesson,
  onContinueLearning,
  firstUncompletedLessonIndex
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategories, setShowCategories] = useState(false);

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
      const matchesSearch = searchTerm === '' || 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [lessons, selectedCategory, selectedDifficulty, searchTerm]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-orange-100 text-orange-800 border-orange-200'
    ];
    const index = categories.indexOf(category) % colors.length;
    return colors[index];
  };

  const handleStartSection = (lessonIndex: number, sectionIndex: number) => {
    onStartLesson(lessonIndex, sectionIndex);
  };

  if (showCategories) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Browse by Category</h2>
            <p className="text-gray-600">Explore vocabulary organized by topics and difficulty levels</p>
          </div>
          <button
            onClick={() => setShowCategories(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Lessons
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryLessons = lessons.filter(lesson => lesson.category === category);
            const completedCategoryLessons = categoryLessons.filter(lesson => lesson.completed).length;
            const totalWordsInCategory = categoryLessons.reduce((sum, lesson) => sum + lesson.totalWords, 0);
            
            // Count words by difficulty
            const beginnerCount = categoryLessons.filter(l => l.difficulty === 'beginner').reduce((sum, l) => sum + l.totalWords, 0);
            const intermediateCount = categoryLessons.filter(l => l.difficulty === 'intermediate').reduce((sum, l) => sum + l.totalWords, 0);
            const advancedCount = categoryLessons.filter(l => l.difficulty === 'advanced').reduce((sum, l) => sum + l.totalWords, 0);
            
            return (
              <div
                key={category}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category);
                  setShowCategories(false);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 capitalize">{category}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(category)}`}>
                    {totalWordsInCategory} words
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Lessons:</span>
                    <span className="font-medium">{categoryLessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">{completedCategoryLessons}</span>
                  </div>
                  
                  {/* Difficulty breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-600">{beginnerCount}</div>
                      <div className="text-green-500">Beginner</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-bold text-yellow-600">{intermediateCount}</div>
                      <div className="text-yellow-500">Intermediate</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-bold text-red-600">{advancedCount}</div>
                      <div className="text-red-500">Advanced</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${categoryLessons.length > 0 ? (completedCategoryLessons / categoryLessons.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                  <span>Explore Category</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Lesson</h2>
          <p className="text-gray-600">Select a lesson or section to continue your learning journey</p>
        </div>
        
        <div className="flex items-center gap-3">
        <button
            onClick={onContinueLearning}
            disabled={firstUncompletedLessonIndex === -1}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {firstUncompletedLessonIndex === -1 ? 'All Lessons Completed' : 'Continue Learning'}
          </button>
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Target className="w-4 h-4" />
            Browse Categories
          </button>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Clear Filters */}
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSearchTerm('');
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Lessons */}
      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No lessons found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredLessons.map((lesson) => {
            const isLocked = lesson.isLocked;
            const originalIndex = lessons.findIndex(l => l.id === lesson.id);
            return (
            <div
              key={lesson.id}
              className={`bg-white rounded-xl shadow-lg transition-all duration-200 ${
                isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
              } ${
                viewMode === 'list' ? 'p-6' : 'p-6'
              }`}
            >
              {/* Lesson Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                  {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                    <h3 className={`text-lg font-bold ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>{lesson.title}</h3>
                    {lesson.completed && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(lesson.category)}`}>
                      {lesson.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lesson Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-indigo-600">{lesson.sections.length}</div>
                  <div className="text-xs text-gray-500">Sections</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-emerald-600">{lesson.totalWords}</div>
                  <div className="text-xs text-gray-500">Words</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-600">
                    {lesson.sections.filter(s => s.completed).length}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">
                    {lesson.sections.length > 0 ? Math.round((lesson.sections.filter(s => s.completed).length / lesson.sections.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lesson.sections.length > 0 ? (lesson.sections.filter(s => s.completed).length / lesson.sections.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Sections
                </h4>
                {lesson.sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      section.completed 
                        ? 'bg-green-50 border-green-200' 
                        : isLocked ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {section.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Section {sectionIndex + 1}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({section.words.length} words)
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleStartSection(originalIndex, sectionIndex)}
                      disabled={isLocked}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        section.completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : isLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {section.completed ? 'Review' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  // Find the first uncompleted section, or start from 0 if all completed
                  const firstUncompletedSectionIndex = lesson.sections.findIndex(s => !s.completed);
                  const sectionToStart = firstUncompletedSectionIndex === -1 ? 0 : firstUncompletedSectionIndex;
                  onStartLesson(originalIndex, sectionToStart);
                }}
                disabled={isLocked}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  lesson.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : isLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Locked
                  </>
                ) : lesson.completed ? (
                  <>
                    <Award className="w-4 h-4" />
                    Review Lesson
                  </>
                ) : lesson.sections.some(s => s.completed) ? (
                  <>
                    <Play className="w-4 h-4" />
                    Continue Lesson
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Lesson
                  </>
                )}
              </button>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};