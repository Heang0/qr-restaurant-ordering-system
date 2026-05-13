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
    <div className="fixed bottom-6 left-6 right-6 z-[45] animate-slideUp">
      <button
        onClick={onClick}
        className="w-full h-16 bg-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-between px-6 hover:scale-[1.02] active:scale-95 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-black text-[13px]">{count}</span>
          </div>
          <span className={`text-white text-[13px] font-black uppercase tracking-widest ${language === 'km' ? 'font-khmer font-medium' : 'font-sans'}`}>
            {language === 'km' ? 'មុខម្ហូបបានជ្រើសរើស' : 'Item Selected'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-white/60 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Total</span>
            <span className="text-white text-[18px] font-black tracking-tighter leading-none">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

export default FloatingCartButton;
