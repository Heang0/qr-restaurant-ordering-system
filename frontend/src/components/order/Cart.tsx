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
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Cart Sheet */}
      <div className="relative bg-white w-full sm:max-w-xl max-h-[92vh] sm:rounded-[3rem] rounded-t-[3rem] shadow-2xl flex flex-col animate-slideUp overflow-hidden">
        {/* Handle for Mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className={`text-xl font-black text-gray-900 ${language === 'km' ? 'font-khmer font-bold text-2xl' : 'font-sans'}`}>
              {t('order.cart.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className={`text-sm font-black text-gray-300 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-bold' : 'font-sans'}`}>
                {t('order.cart.empty')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.menuItemId} className="group relative flex gap-5 bg-gray-50/50 p-4 rounded-3xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-900/5">
                  {/* Image */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-100">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-6">
                        <h3 className={`text-sm font-black text-gray-900 truncate ${language === 'km' ? 'font-khmer font-bold text-[16px]' : 'font-sans'}`}>
                          {language === 'km' && item.nameKm ? item.nameKm : item.name}
                        </h3>
                        <p className="text-lg font-black text-primary leading-tight mt-0.5">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => onRemoveFromCart(item.menuItemId)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="relative group/input">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-primary transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => onUpdateNotes(item.menuItemId, e.target.value)}
                          placeholder={language === 'km' ? 'បន្ថែមចំណាំ...' : 'Add remark...'}
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-100 text-[11px] font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        />
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-10 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-8 pt-6 pb-10 border-t border-gray-50 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Estimated Total</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">${total.toFixed(2)}</span>
              </div>
              <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
              </div>
            </div>
            
            <button
              onClick={onSubmitOrder}
              className={`w-full btn-primary py-5 rounded-[1.5rem] flex items-center justify-center gap-3 group relative overflow-hidden shadow-2xl shadow-primary/30 ${language === 'km' ? 'font-khmer font-bold text-lg' : 'font-sans'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
              <span className="relative z-10">{t('order.cart.placeOrder')}</span>
              <svg className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
