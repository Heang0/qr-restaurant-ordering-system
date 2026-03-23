'use client';

import React from 'react';

interface BottomNavProps {
  cartCount: number;
  onCartClick: () => void;
  language: 'en' | 'km';
  t: (key: string) => string;
  activeTab?: 'menu' | 'orders';
  onTabChange?: (tab: 'menu' | 'orders') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({
  cartCount,
  onCartClick,
  language,
  t,
  activeTab = 'menu',
  onTabChange,
}) => {
  const navItems: Array<{
    id: 'menu' | 'cart' | 'orders';
    icon: string;
    label: string;
    count?: number;
    onClick?: () => void;
  }> = [
    { id: 'menu', icon: 'menu', label: t('common.menu') },
    { id: 'cart', icon: 'cart', label: t('common.cart'), count: cartCount, onClick: onCartClick },
    { id: 'orders', icon: 'orders', label: t('common.orders') },
  ];

  const handleNavClick = (itemId: 'menu' | 'orders') => {
    onTabChange?.(itemId);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      home: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      menu: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      cart: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      orders: (
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    };

    return icons[iconName] || null;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 z-50 shadow-2xl safe-area-pb">
      <nav className="max-w-7xl mx-auto px-2 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = item.id === activeTab;
            let handleClick: (() => void) | undefined;

            if (item.id === 'cart') {
              handleClick = item.onClick;
            } else if (item.id === 'menu' || item.id === 'orders') {
              const tabId = item.id;
              handleClick = () => handleNavClick(tabId);
            }

            return (
              <button
                key={item.id}
                onClick={handleClick}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-300 group relative ${
                  isActive ? 'bg-primary/10' : 'hover:bg-gray-100'
                }`}
              >
                <div className={`transition-colors ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>
                  {getIcon(item.icon)}
                </div>
                <span className={`text-[10px] font-medium leading-none transition-colors ${isActive ? 'text-primary' : 'text-gray-600 group-hover:text-primary'} ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {item.label}
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute top-0.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-md">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </footer>
  );
};

export default BottomNav;
