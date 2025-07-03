import React, { useState } from 'react';
import { User, Languages, Globe } from 'lucide-react';
import { Language } from '../types';

interface UserSetupProps {
  languages: Language[];
  onSetupComplete: (name: string, nativeLanguage: string, targetLanguage: string) => void;
}

export const UserSetup: React.FC<UserSetupProps> = ({ languages, onSetupComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    nativeLanguage: '',
    targetLanguage: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.nativeLanguage) {
      setError('Please select your native language');
      return;
    }

    if (!formData.targetLanguage) {
      setError('Please select the language you want to learn');
      return;
    }

    if (formData.nativeLanguage === formData.targetLanguage) {
      setError('Native language and target language cannot be the same');
      return;
    }

    onSetupComplete(formData.name, formData.nativeLanguage, formData.targetLanguage);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-600 rounded-full p-3">
              <Globe className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PolyChord</h1>
          <p className="text-gray-600">Let's set up your learning profile</p>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              What's your name?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Native Language */}
          <div>
            <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              What language do you speak?
            </label>
            <div className="relative">
              <Languages className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                id="nativeLanguage"
                name="nativeLanguage"
                value={formData.nativeLanguage}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                required
              >
                <option value="">Select your native language</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Language */}
          <div>
            <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 mb-2">
              What language do you want to learn?
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                id="targetLanguage"
                name="targetLanguage"
                value={formData.targetLanguage}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                required
              >
                <option value="">Select target language</option>
                {languages
                  .filter((lang) => lang.code !== formData.nativeLanguage)
                  .map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 outline-none transition-colors"
          >
            Start Learning
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your progress will be saved locally on this device
          </p>
        </div>
      </div>
    </div>
  );
};
