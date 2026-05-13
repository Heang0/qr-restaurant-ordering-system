'use client';

import React from 'react';

interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'km';
  t: (key: string) => string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  isOpen,
  onClose,
  language,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center animate-scaleIn">
        {/* Success Icon - Brand Infused */}
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h2 className={`text-3xl font-black text-gray-900 mb-4 tracking-tight ${language === 'km' ? 'font-khmer font-bold' : 'font-sans'}`}>
          {t('order.confirmation.title')}
        </h2>

        {/* Message */}
        <p className={`text-[14px] text-gray-400 leading-relaxed mb-10 ${language === 'km' ? 'font-khmer' : 'font-sans font-medium'}`}>
          {t('order.confirmation.message')}
        </p>

        {/* Continue Shopping Button */}
        <button
          onClick={onClose}
          className={`w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-[13px] uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 ${language === 'km' ? 'font-khmer font-bold' : 'font-sans'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('order.confirmation.continueShopping')}
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
