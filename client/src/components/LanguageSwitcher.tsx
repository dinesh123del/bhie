import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { premiumFeedback } from '../utils/premiumFeedback';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' }
];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
    premiumFeedback.click();
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          premiumFeedback.click();
        }}
        className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-brand-500 dark:hover:text-brand-400 transition-all group"
        title={t('language')}
      >
        <Languages className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
          {currentLanguage.code}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-48 rounded-2xl bg-white dark:bg-[#0f172a] border border-black/[0.03] dark:border-white/5 shadow-2xl p-2 z-50 ring-1 ring-black/5"
          >
            <div className="py-1 px-2 mb-1">
              <p className="text-[9px] font-black text-black/20 dark:text-white/20 tracking-widest uppercase">
                {t('language')} Registry
              </p>
            </div>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                    i18n.language === lang.code
                      ? 'bg-brand-500/10 text-brand-500'
                      : 'text-black/50 dark:text-white/40 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {i18n.language === lang.code && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
