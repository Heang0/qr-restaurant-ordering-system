'use client';

import React from 'react';

interface FloatingCartButtonProps {
  count: number;
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 pulse-animation"
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[10px] sm:text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg">
          {count}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;
