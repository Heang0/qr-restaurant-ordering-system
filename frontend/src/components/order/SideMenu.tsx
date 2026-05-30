'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: 'menu' | 'orders' | 'checkout') => void;
  activeTab: string;
  storeName?: string;
  storeLogo?: string;
  unreadCount?: number;
}

const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  onClose, 
  onTabChange, 
  activeTab,
  storeName,
  storeLogo,
  unreadCount = 0
}) => {
  const { language, t } = useLanguage();

  const menuItems = [
    { 
      id: 'menu', 
      label: language === 'km' ? 'ទំព័រដើម' : 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'orders', 
      label: language === 'km' ? 'ការបញ្ជាទិញរបស់ខ្ញុំ' : 'My Orders', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      id: 'checkout', 
      label: language === 'km' ? 'កញ្ចប់ទំនិញ' : 'Cart', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Menu Content */}
      <div className="relative bg-white w-[300px] h-full shadow-2xl flex flex-col animate-slideRight">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="w-12 h-12 rounded-2xl object-cover" />
          ) : (
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h2 className={`text-xl font-semibold text-gray-900 tracking-tight leading-none ${language === 'km' ? 'font-khmer' : ''}`}>
              {storeName || 'Loading...'}
            </h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'menu' || item.id === 'orders' || item.id === 'checkout') {
                    onTabChange(item.id);
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-primary'}`}>{item.icon}</span>
                <span className={`text-[12px] font-medium uppercase tracking-widest flex-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {item.label}
                </span>
                {item.id === 'orders' && unreadCount > 0 && (
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scaleIn">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Language Switcher in SideMenu */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/30">
          <p className={`text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ជ្រើសរើសភាសា' : 'Select Language'}
          </p>
          <LanguageSwitcher />
        </div>

        <div className="p-6 border-t border-gray-50">
          <p className="text-[10px] font-medium text-gray-300 uppercase tracking-[0.3em] text-center">Version 1.0.2</p>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
