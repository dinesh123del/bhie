import { useState, useEffect } from 'react';

interface TranslationResponse {
  success: boolean;
  language?: {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    detectedFrom: string;
  };
  languages?: Array<{ code: string; name: string }>;
  isRTL?: boolean;
  currencySymbol?: string;
  translated?: string;
  translations?: Record<string, string>;
  error?: string;
  fallback?: any;
}

export const useBizPlusTranslation = () => {
  const [language, setLanguage] = useState<string>('en');
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [loading, setLoading] = useState<boolean>(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Detect language from IP on mount
  useEffect(() => {
    detectLanguageFromIP();
  }, []);

  const detectLanguageFromIP = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/language/detect-from-ip');
      const data: TranslationResponse = await response.json();

      if (data.success && data.language) {
        setLanguage(data.language.code);
        setIsRTL(data.isRTL || false);
        setCurrencySymbol(data.currencySymbol || '₹');
        localStorage.setItem('bizplus-language', data.language.code);
        localStorage.setItem('bizplus-rtl', String(data.isRTL || false));
        localStorage.setItem('bizplus-currency', data.currencySymbol || '₹');
      }
    } catch (error) {
      console.error('Language detection failed:', error);
      // Fallback to stored preference or English
      const storedLang = localStorage.getItem('bizplus-language') || 'en';
      setLanguage(storedLang);
    } finally {
      setLoading(false);
    }
  };

  const detectLanguageFromBrowser = async () => {
    try {
      const response = await fetch('/api/language/detect-from-browser');
      const data: TranslationResponse = await response.json();

      if (data.success && data.language) {
        setLanguage(data.language.code);
        setIsRTL(data.isRTL || false);
        setCurrencySymbol(data.currencySymbol || '₹');
      }
    } catch (error) {
      console.error('Browser language detection failed:', error);
    }
  };

  const detectLanguageFromGPS = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch('/api/language/detect-from-gps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      const data: TranslationResponse = await response.json();

      if (data.success && data.language) {
        setLanguage(data.language.code);
        setIsRTL(data.isRTL || false);
        setCurrencySymbol(data.currencySymbol || '₹');
      }
    } catch (error) {
      console.error('GPS language detection failed:', error);
    }
  };

  const changeLanguage = (langCode: string) => {
    setLanguage(langCode);
    localStorage.setItem('bizplus-language', langCode);
    
    // Update RTL and currency
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const newIsRTL = rtlLanguages.includes(langCode);
    setIsRTL(newIsRTL);
    localStorage.setItem('bizplus-rtl', String(newIsRTL));

    const currencyMap: Record<string, string> = {
      'en': '$',
      'hi': '₹',
      'te': '₹',
      'ta': '₹',
      'mr': '₹',
      'bn': '₹',
      'es': '€',
      'fr': '€',
      'de': '€',
      'pt': '€',
      'ar': 'د.إ',
      'zh': '¥',
      'ja': '¥',
      'ko': '₩',
      'it': '€',
      'ru': '₽',
      'nl': '€',
      'id': 'Rp',
      'ms': 'RM',
      'tr': '₺',
    };
    setCurrencySymbol(currencyMap[langCode] || '$');
    localStorage.setItem('bizplus-currency', currencyMap[langCode] || '$');

    // Update document direction
    document.documentElement.dir = newIsRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = langCode;
  };

  const translate = async (key: string, targetLang?: string): Promise<string> => {
    try {
      const lang = targetLang || language;
      const response = await fetch(`/api/language/translate?key=${key}&language=${lang}`);
      const data: TranslationResponse = await response.json();

      if (data.success && data.translated) {
        return data.translated;
      }
      return key; // Fallback to key if translation fails
    } catch (error) {
      console.error('Translation failed:', error);
      return key;
    }
  };

  const translateBatch = async (keys: string[], targetLang?: string): Promise<Record<string, string>> => {
    try {
      const lang = targetLang || language;
      const response = await fetch('/api/language/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys, language: lang }),
      });
      const data: TranslationResponse = await response.json();

      if (data.success && data.translations) {
        setTranslations(data.translations);
        return data.translations;
      }
      return {};
    } catch (error) {
      console.error('Batch translation failed:', error);
      return {};
    }
  };

  const getSupportedLanguages = async () => {
    try {
      const response = await fetch('/api/language/supported');
      const data: TranslationResponse = await response.json();

      if (data.success) {
        return data.languages;
      }
      return [];
    } catch (error) {
      console.error('Get supported languages failed:', error);
      return [];
    }
  };

  return {
    language,
    isRTL,
    currencySymbol,
    loading,
    translations,
    detectLanguageFromIP,
    detectLanguageFromBrowser,
    detectLanguageFromGPS,
    changeLanguage,
    translate,
    translateBatch,
    getSupportedLanguages,
  };
};

// Common translation keys for convenience
export const t = (key: string): string => {
  // This is a simple fallback - in production, use the full hook
  const translations: Record<string, string> = {
    'nav.dashboard': 'Dashboard',
    'nav.records': 'Records',
    'nav.analytics': 'Analytics',
    'nav.insights': 'Insights',
    'nav.settings': 'Settings',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.netProfit': 'Net Profit',
    'dashboard.healthScore': 'Health Score',
  };
  return translations[key] || key;
};
