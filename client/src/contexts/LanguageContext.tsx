import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import i18n from '../i18n';
import { useTranslation as useI18nTranslation } from 'react-i18next';

type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'te' | 'ta' | 'kn' | 'ml';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const CACHE_KEY = 'bhie_ai_translations';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t: i18nT } = useI18nTranslation();
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('bhie_language') as Language) || 'en'
  );
  const [aiTranslations, setAiTranslations] = useState<Record<string, Record<string, string>>>(
    JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  );
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    localStorage.setItem('bhie_language', language);
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(aiTranslations));
  }, [aiTranslations]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (lang !== 'en') {
      toast.success(`Switching to ${lang.toUpperCase()}...`);
    }
  };

  const t = useCallback((text: string): string => {
    if (!text || language === 'en') return text;
    
    // 1. Try standard i18next
    const standardT = i18nT(text);
    if (standardT !== text) return standardT;

    // 2. Try AI Cache
    if (aiTranslations[language] && aiTranslations[language][text]) {
      return aiTranslations[language][text];
    }

    // 3. Fallback to English but trigger AI translation in background (optional)
    // For this demo, let's just return the text.
    return text;
  }, [language, i18nT, aiTranslations]);

  // Expose a way to translate a batch of text or specific text with AI
  const translateWithAI = async (text: string) => {
    if (language === 'en' || !text) return text;
    if (aiTranslations[language]?.[text]) return aiTranslations[language][text];

    try {
      setIsTranslating(true);
      const response = await api.post('/ai/translate', { 
        text, 
        targetLanguage: language === 'hi' ? 'Hindi' : 
                        language === 'te' ? 'Telugu' : 
                        language === 'es' ? 'Spanish' : 
                        language === 'fr' ? 'French' : 
                        language === 'de' ? 'German' : 
                        language === 'ta' ? 'Tamil' : 
                        language === 'kn' ? 'Kannada' : 
                        language === 'ml' ? 'Malayalam' : 'English'
      });
      
      const translation = response.data.translation;
      
      setAiTranslations(prev => ({
        ...prev,
        [language]: {
          ...(prev[language] || {}),
          [text]: translation
        }
      }));
      
      return translation;
    } catch (error) {
      console.error('AI Translation failed:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  // Automatically try to translate new strings if they appear (limited way)
  // This is a bit complex for a broad app, so we'll provide the tool for components to call.

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
