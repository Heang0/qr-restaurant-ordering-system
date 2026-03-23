'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'km' : 'en')}
      className={`flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 hover:border-primary transition-all shadow-sm ${className}`}
      title={language === 'en' ? 'Switch to Khmer' : 'Switch to English'}
    >
      {language === 'en' ? (
        // Show Khmer flag when using English
        <span className="text-xl">🇰🇭</span>
      ) : (
        // Show USA flag when using Khmer
        <span className="text-xl">🇺🇸</span>
      )}
      <span className={`text-sm font-semibold ${language === 'en' ? 'text-gray-700' : 'text-gray-700'}`}>
        {language === 'en' ? 'KH' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
