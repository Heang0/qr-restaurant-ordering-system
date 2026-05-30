'use client';

import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  language?: 'en' | 'km';
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  language = 'en'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fadeIn px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[280px] bg-white/95 backdrop-blur-xl rounded-[18px] shadow-2xl overflow-hidden animate-scaleIn text-center flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 pb-5 px-4 flex flex-col gap-1">
          <h3 className={`text-[17px] font-semibold text-black tracking-tight ${language === 'km' ? 'font-khmer leading-relaxed' : ''}`}>
            {title}
          </h3>
          <p className={`text-[13px] text-gray-600 leading-snug ${language === 'km' ? 'font-khmer mt-1' : ''}`}>
            {message}
          </p>
        </div>
        
        <div className="border-t border-gray-200/60 w-full">
          <button
            onClick={onClose}
            className={`w-full py-3.5 text-[17px] text-[#007AFF] hover:bg-gray-50 transition-colors font-semibold active:bg-gray-100 ${language === 'km' ? 'font-khmer' : ''}`}
          >
            {buttonText || (language === 'km' ? 'យល់ព្រម' : 'OK')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
