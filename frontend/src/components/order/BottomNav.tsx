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
        <svg className={`w-5 h-5 transition-all duration-500 ${isActive ? 'scale-110' : ''}`} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 1.5 : 2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      cart: (
        <svg className={`w-5 h-5 transition-all duration-500 ${isActive ? 'scale-110' : ''}`} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 1.5 : 2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      orders: (
        <svg className={`w-5 h-5 transition-all duration-500 ${isActive ? 'scale-110' : ''}`} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 1.5 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    };

    return icons[iconName] || null;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <nav className="bg-gray-900/90 backdrop-blur-2xl rounded-[2rem] p-2 shadow-2xl shadow-gray-900/40 border border-white/10 ring-1 ring-white/5">
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
                className={`relative flex flex-1 flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all duration-500 group ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 rounded-2xl animate-scaleIn"></div>
                )}
                
                <div className="relative mb-1">
                  {getIcon(item.icon, isActive)}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-xl ring-2 ring-gray-900 animate-bounce">
                      {item.count}
                    </span>
                  )}
                </div>
                
                <span className={`relative text-[9px] font-black uppercase tracking-widest ${language === 'km' ? 'font-khmer text-[10px] font-bold tracking-normal' : 'font-sans'}`}>
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
