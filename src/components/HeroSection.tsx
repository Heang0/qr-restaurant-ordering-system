'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left animate-fadeIn">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${
              language === 'km' ? 'font-khmer text-khmer' : 'font-sans'
            }`}>
              <span className="bg-gradient-to-r from-primary via-primary-dark to-secondary bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
            <p className={`text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0 ${
              language === 'km' ? 'font-khmer' : 'font-sans'
            }`}>
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="https://t.me/Emma_Heang"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 btn-hover-lift"
              >
                {t('home.getStarted')}
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="#features"
                className="bg-white text-gray-800 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-primary hover:text-primary hover:shadow-lg transition-all duration-300 btn-hover-lift"
              >
                {t('home.learnMore')}
              </Link>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-1 flex justify-center items-center animate-scaleIn">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative w-[280px] h-[580px] md:w-[320px] md:h-[650px] bg-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-800 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-gray-800 rounded-b-2xl z-20"></div>
                
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <iframe
                    src="https://www.orderhey.online/order.html?storeSlug=orderhey&table=A1"
                    className="w-full h-full border-0"
                    title="OrderHey Demo"
                    allowFullScreen
                  />
                </div>

                {/* Side Buttons */}
                <div className="absolute left-[-6px] top-28 w-1.5 h-12 bg-gray-700 rounded-l"></div>
                <div className="absolute left-[-6px] top-44 w-1.5 h-12 bg-gray-700 rounded-l"></div>
                <div className="absolute right-[-6px] top-32 w-1.5 h-16 bg-gray-700 rounded-r"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
