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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scaleIn">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold text-gray-800 mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {t('order.confirmation.title')}
        </h2>

        {/* Message */}
        <p className={`text-gray-600 mb-8 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {t('order.confirmation.message')}
        </p>

        {/* Continue Shopping Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 btn-hover-lift flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('order.confirmation.continueShopping')}
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
