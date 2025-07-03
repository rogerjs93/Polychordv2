import React, { useState, useMemo } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Star, Filter, Search, Grid, List, ArrowRight, Target, Award } from 'lucide-react';
import { VocabularyItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface LessonSelectorProps {
  vocabulary: VocabularyItem[];
  onStartLesson: (sectionIndex: number, lessonIndex: number) => void;
  onStartSection: (sectionIndex: number) => void;
  completedSections: Set<string>;
  completedLessons: Set<string>;
}

interface LessonSection {
  id: string;
  title: string;
  words: VocabularyItem[];
  completed: boolean;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  sections: LessonSection[];
  totalWords: number;
  completed: boolean;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  vocabulary,
  onStartLesson,
  onStartSection,
  completedSections,
  completedLessons
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategories, setShowCategories] = useState(false);

  // Organize vocabulary into lessons and sections
  const { lessons, categories } = useMemo(() => {
    const wordsPerSection = 10;
    const sectionsPerLesson = 3;
    
    // Group words by category and difficulty
    const wordsByCategory = vocabulary.reduce((acc, word) => {
      if (!acc[word.category]) {
        acc[word.category] = [];
      }
      acc[word.category].push(word);
      return acc;
    }, {} as Record<string, VocabularyItem[]>);

    const allCategories = Object.keys(wordsByCategory);
    const generatedLessons: Lesson[] = [];

    // Create lessons for each category, organized by difficulty
    allCategories.forEach((category) => {
      const categoryWords = wordsByCategory[category];
      
      // Group by difficulty within category
      const beginnerWords = categoryWords.filter(w => w.difficulty === 'beginner');
      const intermediateWords = categoryWords.filter(w => w.difficulty === 'intermediate');
      const advancedWords = categoryWords.filter(w => w.difficulty === 'advanced');
      
      // Create lessons for each difficulty level
      [
        { words: beginnerWords, difficulty: 'beginner' as const },
        { words: intermediateWords, difficulty: 'intermediate' as const },
        { words: advancedWords, difficulty: 'advanced' as const }
      ].forEach(({ words, difficulty }) => {
        if (words.length === 0) return;
        
        const totalSections = Math.ceil(words.length / wordsPerSection);
        const totalLessons = Math.ceil(totalSections / sectionsPerLesson);

        for (let lessonIndex = 0; lessonIndex < totalLessons; lessonIndex++) {
          const lessonSections: LessonSection[] = [];
          const startSectionIndex = lessonIndex * sectionsPerLesson;
          const endSectionIndex = Math.min(startSectionIndex + sectionsPerLesson, totalSections);

          for (let sectionIndex = startSectionIndex; sectionIndex < endSectionIndex; sectionIndex++) {
            const startWordIndex = sectionIndex * wordsPerSection;
            const endWordIndex = Math.min(startWordIndex + wordsPerSection, words.length);
            const sectionWords = words.slice(startWordIndex, endWordIndex);

            if (sectionWords.length > 0) {
              const sectionId = `${category}-${difficulty}-section-${sectionIndex}`;
              lessonSections.push({
                id: sectionId,
                title: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - Section ${sectionIndex + 1}`,
                words: sectionWords,
                completed: completedSections.has(sectionId),
                category,
                difficulty
              });
            }
          }

          if (lessonSections.length > 0) {
            const lessonId = `${category}-${difficulty}-lesson-${lessonIndex}`;
            const totalWords = lessonSections.reduce((sum, section) => sum + section.words.length, 0);
            
            generatedLessons.push({
              id: lessonId,
              title: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - Lesson ${lessonIndex + 1}`,
              description: `Learn ${totalWords} ${difficulty} words about ${category}`,
              sections: lessonSections,
              totalWords,
              completed: completedLessons.has(lessonId),
              category,
              difficulty
            });
          }
        }
      });
    });

    // Sort lessons by difficulty, then by category
    generatedLessons.sort((a, b) => {
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const difficultyDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      
      if (difficultyDiff !== 0) {
        return difficultyDiff;
      }
      
      return a.category.localeCompare(b.category);
    });

    return { lessons: generatedLessons, categories: allCategories };
  }, [vocabulary, completedSections, completedLessons]);

  // Filter lessons based on search and filters
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
            const categoryWords = vocabulary.filter(word => word.category === category);
            const categoryLessons = lessons.filter(lesson => lesson.category === category);
            const completedCategoryLessons = categoryLessons.filter(lesson => lesson.completed).length;
            
            // Count words by difficulty
            const beginnerCount = categoryWords.filter(w => w.difficulty === 'beginner').length;
            const intermediateCount = categoryWords.filter(w => w.difficulty === 'intermediate').length;
            const advancedCount = categoryWords.filter(w => w.difficulty === 'advanced').length;
            
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
                    {categoryWords.length} words
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
          {filteredLessons.map((lesson, lessonIndex) => (
            <div
              key={lesson.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                viewMode === 'list' ? 'p-6' : 'p-6'
              }`}
            >
              {/* Lesson Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{lesson.title}</h3>
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
                    {Math.round((lesson.sections.filter(s => s.completed).length / lesson.sections.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(lesson.sections.filter(s => s.completed).length / lesson.sections.length) * 100}%` }}
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
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {section.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
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
                      onClick={() => onStartSection(lessonIndex * 3 + sectionIndex)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        section.completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {section.completed ? 'Review' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onStartLesson(lessonIndex, 0)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  lesson.completed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
              >
                {lesson.completed ? (
                  <>
                    <Award className="w-4 h-4" />
                    Review Lesson
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Lesson
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};