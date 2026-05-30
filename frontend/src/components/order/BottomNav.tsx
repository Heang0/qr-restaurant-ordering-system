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
    { id: 'menu', icon: 'menu', label: language === 'km' ? 'ម៉ឺនុយ' : 'Menu' },
    { id: 'cart', icon: 'cart', label: language === 'km' ? 'កញ្ចប់' : 'Cart', count: cartCount, onClick: onCartClick },
    { id: 'orders', icon: 'orders', label: language === 'km' ? 'ការបញ្ជាទិញ' : 'Orders' },
  ];

  const handleNavClick = (itemId: 'menu' | 'orders') => {
    onTabChange?.(itemId);
  };

  const getIcon = (iconName: string, isActive: boolean) => {
    const icons: Record<string, JSX.Element> = {
      menu: (
        <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 1.5 : 2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      cart: (
        <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 1.5 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      orders: (
        <svg className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 1.5 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    };

    return icons[iconName] || null;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <nav className="bg-white/95 backdrop-blur-md border border-primary/5 rounded-[2rem] p-1.5 shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between">
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
                className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-500 group ${
                  isActive ? 'text-primary' : 'text-gray-300 hover:text-primary/50'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-scaleIn"></div>
                )}
                
                <div className="relative mb-1">
                  {getIcon(item.id, isActive)}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-lg animate-bounce">
                      {item.count}
                    </span>
                  )}
                </div>
                
                <span className={`relative text-[8px] font-black uppercase tracking-[0.1em] ${language === 'km' ? 'font-khmer text-[9px] font-bold tracking-normal' : 'font-sans'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
