'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden bg-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/3 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className={`text-xs font-normal text-primary uppercase tracking-wider ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {language === 'km' ? 'ទទួលបានការទុកចិត្តពីភោជនីយដ្ឋានជាង ១០០+' : 'Trusted by 100+ Restaurants'}
              </span>
            </div>

            <h1 className={`text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 ${
              language === 'km' ? 'font-khmer text-khmer font-normal' : 'font-sans font-extrabold'
            }`}>
              <span className="block text-gray-900 mb-2">
                {language === 'km' ? 'លើកកម្ពស់' : 'Elevate Your'}
              </span>
              <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent animate-shimmer">
                {language === 'km' ? 'បទពិសោធន៍នៃការញ៉ាំអាហារ' : 'Dining Experience'}
              </span>
            </h1>

            <p className={`text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
              language === 'km' ? 'font-khmer font-normal' : 'font-sans text-gray-500'
            }`}>
              {t('home.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link
                href="/register"
                className={`btn-primary flex items-center justify-center gap-2 group text-lg py-4 px-10 shadow-primary/20 shadow-2xl ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'}`}
              >
                {t('home.getStarted')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#features"
                className={`btn-secondary flex items-center justify-center text-lg py-4 px-10 shadow-premium ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'}`}
              >
                {t('home.learnMore')}
              </Link>
            </div>

            {/* Social Proof/Metrics */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className={`text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                  {language === 'km' ? 'ដំណើរការរលូន' : 'Uptime'}
                </div>
              </div>
              <div className="w-[1px] h-10 bg-gray-100"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className={`text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                  {language === 'km' ? 'ការបញ្ជាទិញប្រចាំថ្ងៃ' : 'Daily Orders'}
                </div>
              </div>
              <div className="w-[1px] h-10 bg-gray-100"></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className={`text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                  {language === 'km' ? 'ការគាំទ្រ' : 'Support'}
                </div>
              </div>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex-1 flex justify-center items-center relative">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px]"></div>

            <div className="relative group">
              {/* Phone Frame */}
              <div className="relative w-[300px] h-[620px] md:w-[340px] md:h-[700px] bg-gray-900 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[8px] border-gray-800 overflow-hidden ring-1 ring-white/10">
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-10 h-1 bg-white/10 rounded-full"></div>
                </div>
                
                {/* Screen Content */}
                <div className="w-full h-full bg-[#f8fafc] rounded-[2.8rem] overflow-hidden">
                  <iframe
                    src="https://www.orderhey.online/order.html?storeSlug=orderhey&table=A1"
                    className="w-full h-full border-0"
                    title="OrderHey Demo"
                  />
                </div>

                {/* Glass reflections */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50"></div>
              </div>

              {/* Floating badges - Hidden on mobile */}
              <div className="hidden md:block absolute -right-12 top-20 glass p-4 rounded-2xl shadow-premium animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">New Order</div>
                    <div className="text-sm font-bold text-gray-800">$24.50 Success</div>
                  </div>
                </div>
              </div>

              <div className="hidden md:block absolute -left-16 bottom-24 glass p-4 rounded-2xl shadow-premium animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Wait Time</div>
                    <div className="text-sm font-bold text-gray-800">&lt; 5 Minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
