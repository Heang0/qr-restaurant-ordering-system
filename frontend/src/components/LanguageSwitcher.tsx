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
      className={`flex items-center gap-2.5 bg-white/50 border border-gray-100 rounded-full pl-1.5 pr-4 py-1.5 hover:bg-white hover:shadow-md transition-all group ${className}`}
      title={language === 'en' ? 'Switch to Khmer' : 'Switch to English'}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
        <img
          src={language === 'en' ? 'https://flagcdn.com/w80/kh.png' : 'https://flagcdn.com/w80/us.png'}
          alt={language === 'en' ? 'Khmer' : 'English'}
          className="w-full h-full object-cover"
        />
      </div>
      <span className={`text-xs font-black tracking-widest text-gray-700`}>
        {language === 'en' ? 'KH' : 'ENG'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
