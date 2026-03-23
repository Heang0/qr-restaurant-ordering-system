'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface HeaderProps {
  tableId: string;
  language: 'en' | 'km';
  storeName?: string;
  storeLogo?: string;
}

const Header: React.FC<HeaderProps> = ({ tableId, language, storeName, storeLogo }) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 glass shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {storeLogo ? (
              <div className="h-12 w-12 overflow-hidden rounded-xl shadow-sm">
                <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-sm">
                <span className="text-white font-bold text-xl">O</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className={`truncate text-xl font-bold leading-tight text-gray-800 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {storeName || 'Loading...'}
              </h1>
            </div>
          </div>

          <div className="ml-3 flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-dark px-3 py-2 text-white shadow-lg sm:px-4">
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className={`whitespace-nowrap text-[13px] font-semibold leading-none sm:text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {t('common.table')}: <span className="font-bold">{tableId}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
