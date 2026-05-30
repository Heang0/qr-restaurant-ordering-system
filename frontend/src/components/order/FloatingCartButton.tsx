'use client';

import React from 'react';

interface FloatingCartButtonProps {
  count: number;
  totalPrice?: number;
  onClick: () => void;
  language?: 'en' | 'km';
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ count, totalPrice = 0, onClick, language = 'en' }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-[100px] left-6 right-6 z-[45] animate-slideUp">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full blur-lg opacity-20 animate-pulse"></div>
      <button
        onClick={onClick}
        className="relative w-full h-14 sm:h-16 bg-primary rounded-full shadow-[0_20px_50px_rgba(255,82,0,0.3)] flex items-center justify-between px-4 sm:px-7 hover:scale-[1.02] active:scale-95 transition-all duration-500 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
              <span className="text-white font-black text-[13px] sm:text-[14px]">{count}</span>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className={`text-white text-[12px] sm:text-[13px] font-black uppercase tracking-widest leading-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'មើលកញ្ចប់ទំនិញ' : 'View Cart'}
            </span>
            <span className={`text-white/70 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 hidden sm:block ${language === 'km' ? 'font-khmer' : ''}`}>
              {count} {language === 'km' ? 'មុខ' : 'dishes selected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="h-8 w-[1px] bg-white/20 hidden sm:block"></div>
          <div className="flex flex-col items-end">
            <span className={`text-white/70 text-[8px] font-bold uppercase tracking-[0.2em] leading-none mb-1 hidden sm:block ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'សរុប' : 'Total'}
            </span>
            <span className="text-white text-[16px] sm:text-[20px] font-black tracking-tighter leading-none">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-[0_5px_15px_rgba(255,255,255,0.3)] group-hover:rotate-12 transition-transform duration-500">
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

export default FloatingCartButton;
