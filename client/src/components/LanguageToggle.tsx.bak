import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (Hindi)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'te', name: 'Telugu (Telugu)' },
  { code: 'ta', name: 'Tamil (Tamil)' },
  { code: 'kn', name: 'Kannada (Kannada)' },
  { code: 'ml', name: 'Malayalam (Malayalam)' },
];

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0A0A0A]/60/50 border border-slate-700 hover:border-indigo-500/50 transition-all text-sm font-medium text-[#C0C0C0] hover:text-white"
      >
        <Languages className="w-4 h-4 text-indigo-400" />
        <span className="hidden sm:inline">{selectedLang.name.split(' (')[0]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 py-2 bg-[#0A0A0A]/80 border border-white/5/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-3 py-1 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Select Language
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-hide">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                      language === lang.code 
                        ? 'bg-indigo-600/20 text-indigo-400' 
                        : 'text-[#C0C0C0] hover:bg-[#0A0A0A]/60 hover:text-white'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
