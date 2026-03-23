'use client';

import React from 'react';
import { CartItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onAddToCart: (item: any, quantity: number) => void;
  onRemoveFromCart: (menuItemId: string) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onUpdateNotes: (menuItemId: string, notes: string) => void;
  onSubmitOrder: () => void;
  language: 'en' | 'km';
  t: (key: string) => string;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  cart,
  total,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onUpdateNotes,
  onSubmitOrder,
  language,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`text-2xl font-bold text-gray-800 flex items-center gap-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {t('order.cart.title')}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className={language === 'km' ? 'font-khmer' : 'font-sans'}>
                {t('order.cart.empty')}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.menuItemId} className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className={`font-bold text-gray-800 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km' && item.nameKm ? item.nameKm : item.name}
                      </h3>
                      <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                    </div>

                    <div>
                      <label className={`mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km' ? 'កំណត់ចំណាំ' : 'Remark'}
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(event) => onUpdateNotes(item.menuItemId, event.target.value)}
                        placeholder={language === 'km' ? 'ឧ. មិនដាក់ទឹកកក' : 'e.g. no ice, less spicy'}
                        className={`h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-primary ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                      />
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className={`w-8 text-center font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.menuItemId)}
                    className="w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors self-start"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-lg font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {t('order.cart.total')}:
              </span>
              <span className="text-2xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onSubmitOrder}
              className={`w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 btn-hover-lift flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('order.cart.placeOrder')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
