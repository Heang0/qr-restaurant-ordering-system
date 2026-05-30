'use client';

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  logo?: string;
  storeName: string;
  language: 'en' | 'km';
}

const SplashScreen: React.FC<SplashScreenProps> = ({ logo, storeName, language }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-fadeOut [animation-delay:2s] [animation-fill-mode:forwards]">
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 -m-8 rounded-full border-2 border-primary/10 animate-ping [animation-duration:3s]"></div>
        <div className="absolute inset-0 -m-16 rounded-full border border-primary/5 animate-ping [animation-duration:4s]"></div>
        
        {/* Logo Container */}
        <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 flex items-center justify-center overflow-hidden animate-scaleIn">
          {logo ? (
            <img src={logo} alt={storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary flex items-center justify-center">
              <span className="text-white text-4xl font-black">{storeName.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center animate-fadeIn [animation-delay:0.3s]">
        <h2 className={`text-2xl font-black text-gray-900 tracking-tight mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>
          {storeName}
        </h2>
        <div className="flex items-center gap-3 justify-center">
           <div className="w-8 h-[2px] bg-primary/20 rounded-full"></div>
           <p className={`text-[10px] font-black text-primary uppercase tracking-[0.3em] ${language === 'km' ? 'font-khmer text-[12px]' : ''}`}>
             {language === 'km' ? 'សូមស្វាគមន៍' : 'Welcome'}
           </p>
           <div className="w-8 h-[2px] bg-primary/20 rounded-full"></div>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-20 w-48 h-1.5 bg-gray-50 rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-progress"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
