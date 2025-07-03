import React, { useState } from 'react';
import { Plus, Trash2, Globe, Check, X, Languages } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../hooks/useAuth';

interface LanguageManagerProps {
  languages: Language[];
  onClose: () => void;
}

export const LanguageManager: React.FC<LanguageManagerProps> = ({ languages, onClose }) => {
  const { user, addLanguagePair, removeLanguagePair } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPair, setNewPair] = useState({
    nativeLanguage: '',
    targetLanguage: ''
  });
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleAddLanguagePair = () => {
    setError('');
    
    if (!newPair.nativeLanguage || !newPair.targetLanguage) {
      setError('Please select both languages');
      return;
    }
    
    if (newPair.nativeLanguage === newPair.targetLanguage) {
      setError('Native and target languages must be different');
      return;
    }
    
    // Check if pair already exists
    const pairExists = user?.languagePairs.some(pair => 
      pair.nativeLanguage === newPair.nativeLanguage && 
      pair.targetLanguage === newPair.targetLanguage
    );
    
    if (pairExists) {
      setError('This language pair already exists');
      return;
    }
    
    addLanguagePair(newPair.nativeLanguage, newPair.targetLanguage);
    setNewPair({ nativeLanguage: '', targetLanguage: '' });
    setShowAddForm(false);
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.nativeName}` : code;
  };

  const handleRemoveClick = (pairId: string) => {
    setShowConfirm(pairId);
  };

  const handleConfirmRemove = (pairId: string) => {
    removeLanguagePair(pairId);
    setShowConfirm(null);
  };

  const handleCancelRemove = () => {
    setShowConfirm(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">Manage Languages</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Add or remove language pairs for your learning journey</p>
        </div>

        <div className="p-6">
          {/* Current Language Pairs */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Language Pairs</h3>
            
            {user?.languagePairs && user.languagePairs.length > 0 ? (
              <div className="space-y-3">
                {user.languagePairs.map((pair) => (
                  <div
                    key={pair.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      user.currentLanguagePair === pair.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getLanguageName(pair.nativeLanguage)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-lg">{getLanguageName(pair.targetLanguage)}</span>
                      </div>
                      {user.currentLanguagePair === pair.id && (
                        <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-600">
                        <div>{pair.progress.wordsLearned} words learned</div>
                        <div className="capitalize">{pair.progress.currentLevel} level</div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveClick(pair.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove language pair"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Confirm Remove Language Pair */}
                    {showConfirm === pair.id && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg shadow-lg">
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-700 mb-4">
                            Are you sure you want to remove this language pair?
                          </p>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleConfirmRemove(pair.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Yes, remove
                            </button>
                            <button
                              onClick={handleCancelRemove}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Languages className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No additional language pairs yet</p>
                <p className="text-sm">Add a new language pair to expand your learning</p>
              </div>
            )}
          </div>

          {/* Add New Language Pair */}
          <div className="border-t border-gray-200 pt-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add New Language Pair
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-4">Add New Language Pair</h4>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I speak
                    </label>
                    <select
                      value={newPair.nativeLanguage}
                      onChange={(e) => setNewPair({ ...newPair, nativeLanguage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select native language</option>
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.nativeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I want to learn
                    </label>
                    <select
                      value={newPair.targetLanguage}
                      onChange={(e) => setNewPair({ ...newPair, targetLanguage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select target language</option>
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.nativeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm mb-4">{error}</div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleAddLanguagePair}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Add Pair
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewPair({ nativeLanguage: '', targetLanguage: '' });
                      setError('');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};