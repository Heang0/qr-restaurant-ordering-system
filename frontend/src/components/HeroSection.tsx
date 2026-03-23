'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Content - Left Side */}
          <div className="flex-1 text-center lg:text-left animate-fadeIn w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {language === 'km' ? 'ដំណោះស្រាយថ្មី' : 'New Solution'}
            </div>

            {/* Main Heading */}
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${
              language === 'km' ? 'font-khmer' : 'font-sans'
            }`}>
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-base md:text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
              language === 'km' ? 'font-khmer' : 'font-sans'
            }`}>
              {t('home.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="https://t.me/Emma_Heang"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-hover-lift flex items-center justify-center gap-2"
              >
                <span>{t('home.getStarted')}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="bg-white text-gray-800 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-red-500 hover:text-red-600 hover:shadow-lg transition-all duration-300 btn-hover-lift flex items-center justify-center"
              >
                {t('home.learnMore')}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{language === 'km' ? 'ងាយស្រួលប្រើ' : 'Easy to Use'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{language === 'km' ? 'រហ័ស' : 'Fast'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{language === 'km' ? 'សន្សំសំចៃ' : 'Cost-Effective'}</span>
              </div>
            </div>
          </div>

          {/* Phone Mockup - Right Side */}
          <div className="flex-1 flex justify-center items-center animate-scaleIn w-full">
            <div className="relative">
              {/* Decorative Ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-[3rem] blur-2xl opacity-20 scale-110"></div>
              
              {/* Phone Frame */}
              <div className="relative w-[260px] h-[540px] sm:w-[280px] sm:h-[580px] md:w-[300px] md:h-[620px] bg-gray-900 rounded-[2.5rem] shadow-2xl border-4 border-gray-800 overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-xl z-20"></div>

                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                  <iframe
                    src="https://www.orderhey.online/orderhey/a1"
                    className="w-full h-full border-0"
                    title="OrderHey Demo"
                    allowFullScreen
                  />
                </div>

                {/* Side Buttons */}
                <div className="absolute left-[-4px] top-24 w-1 h-8 bg-gray-700 rounded-l"></div>
                <div className="absolute left-[-4px] top-36 w-1 h-8 bg-gray-700 rounded-l"></div>
                <div className="absolute right-[-4px] top-28 w-1 h-12 bg-gray-700 rounded-r"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
