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
  onUpdateRemark: (menuItemId: string, remark: string) => void;
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
  onUpdateRemark,
  onSubmitOrder,
  language,
  t,
}) => {
  return (
    <div className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[2.5rem] shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className={`text-lg font-semibold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'កញ្ចប់ទំនិញ' : 'My Cart'}
          </h2>
          <p className={`text-[10px] font-semibold text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
            {cart.length} {language === 'km' ? 'មុខ' : 'Items'}
          </p>
        </div>
      </div>

      {/* Order Items List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className={`text-[12px] font-medium text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
              {t('order.cart.empty')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.cartItemId || item.menuItemId} className="flex gap-4 items-center group animate-fadeIn">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                  <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-[14px] font-semibold text-gray-900 mb-0.5 truncate ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' && item.nameKm ? item.nameKm : item.name}
                  </h3>
                  
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.selectedOptions.map((opt, idx) => (
                        <span key={idx} className={`text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' && opt.nameKm ? opt.nameKm : opt.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.remark && (
                    <p className={`text-[10px] text-gray-400 italic mb-2 truncate ${language === 'km' ? 'font-khmer' : ''}`}>
                      "{item.remark}"
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-[14px] font-semibold text-primary">${item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.cartItemId || item.menuItemId, item.quantity - 1)} 
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary transition-colors text-lg"
                      >
                        -
                      </button>
                      <span className="text-[12px] font-semibold text-gray-900 min-w-[16px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.cartItemId || item.menuItemId, item.quantity + 1)} 
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFromCart(item.cartItemId || item.menuItemId)}
                  className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="pt-4">
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder={language === 'km' ? 'លេខកូដបញ្ចុះតម្លៃ...' : 'Promo Code...'}
                  className={`w-full pl-12 pr-6 py-4 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all text-sm font-medium text-gray-900 placeholder-gray-400 ${language === 'km' ? 'font-khmer' : ''}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary & Checkout */}
      {cart.length > 0 && (
        <div className="px-6 pt-6 pb-10 bg-white border-t border-gray-100">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center">
              <span className={`text-[12px] font-medium text-gray-500 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សរុប' : 'Subtotal'}</span>
              <span className="text-[14px] font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-[12px] font-medium text-gray-500 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ពន្ធ' : 'VAT (10%)'}</span>
              <span className="text-[14px] font-semibold text-gray-900">${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className={`text-[14px] font-semibold text-gray-900 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'ការបង់ប្រាក់សរុប' : 'Total'}
              </span>
              <span className="text-2xl font-semibold text-primary tracking-tight">${(total * 1.1).toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={onSubmitOrder}
            className={`w-full h-14 rounded-xl bg-primary text-white font-semibold text-[14px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${language === 'km' ? 'font-khmer' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {language === 'km' ? 'បញ្ជាទិញ និងបង់ប្រាក់ឥឡូវនេះ' : 'Checkout & Pay Now'}
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Cart;
