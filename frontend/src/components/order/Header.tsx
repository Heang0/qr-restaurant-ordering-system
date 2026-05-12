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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Section */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex-shrink-0 group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-primary-dark rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              {storeLogo ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-gray-100 bg-white">
                  <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white font-black text-xl shadow-xl">
                  {storeName ? storeName.charAt(0).toUpperCase() : 'O'}
                </div>
              )}
            </div>
            
            <div className="flex flex-col min-w-0">
              <h1 className={`text-[17px] font-black text-gray-900 leading-none truncate ${language === 'km' ? 'font-khmer font-bold text-[19px]' : 'font-sans'}`}>
                {storeName || 'Loading...'}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Menu</span>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl shadow-gray-900/10">
              <div className="w-5 h-5 flex items-center justify-center bg-white/20 rounded-lg">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <span className={`text-[11px] font-black tracking-widest uppercase ${language === 'km' ? 'font-khmer text-[12px] font-bold' : 'font-sans'}`}>
                {t('common.table')} {tableId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
