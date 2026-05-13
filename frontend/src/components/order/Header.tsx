'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface HeaderProps {
  tableId: string;
  language: 'en' | 'km';
  storeName?: string;
  storeLogo?: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ tableId, language, storeName, storeLogo, onMenuClick }) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white/80 backdrop-blur-xl px-6 pt-4 pb-3 sticky top-0 z-40 border-b border-gray-200 animate-fadeIn">
      {/* Top Bar: Menu Trigger & Store Info & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2.5">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-gray-100" />
            ) : (
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1">
                <span className={`text-[8px] text-gray-600 font-semibold uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'ទីតាំងតុ' : 'Table'}
                </span>
                <span className="text-[9px] font-semibold text-primary uppercase tracking-widest">{tableId}</span>
              </div>
              <h1 className={`text-[14px] font-semibold text-gray-900 tracking-tight leading-none ${language === 'km' ? 'font-khmer' : ''}`}>
                 {storeName || 'Loading...'}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden lg:block">
             <LanguageSwitcher className="scale-90" />
           </div>
           <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 relative hover:bg-gray-200 transition-colors">
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
