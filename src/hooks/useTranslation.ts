import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import translationsData from '../data/translations.json';

type TranslationKey = keyof typeof translationsData.en;
type Translations = Record<string, Record<string, string>>;

export const useTranslation = () => {
  const { user } = useAuth();
  const [translations] = useState<Translations>(translationsData);

  const currentLanguage = user?.nativeLanguage || 'en';

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = translations[currentLanguage]?.[key] || translations['en'][key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  return { t, currentLanguage };
};