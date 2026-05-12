'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const BenefitsSection: React.FC = () => {
  const { t, language } = useLanguage();

  const benefits = [
    {
      icon: 'fa-qrcode',
      title: t('home.features.seamlessOrdering'),
      description: t('home.features.seamlessOrderingDesc'),
      color: 'from-primary to-primary-dark',
    },
    {
      icon: 'fa-dollar-sign',
      title: t('home.features.costEfficiency'),
      description: t('home.features.costEfficiencyDesc'),
      color: 'from-gray-900 to-black',
    },
    {
      icon: 'fa-sync-alt',
      title: t('home.features.realTimeUpdates'),
      description: t('home.features.realTimeUpdatesDesc'),
      color: 'from-primary to-primary-dark',
    },
    {
      icon: 'fa-chart-line',
      title: t('home.features.analytics'),
      description: t('home.features.analyticsDesc'),
      color: 'from-gray-900 to-black',
    },
    {
      icon: 'fa-headset',
      title: t('home.features.support'),
      description: t('home.features.supportDesc'),
      color: 'from-primary to-primary-dark',
    },
    {
      icon: 'fa-mobile-alt',
      title: t('home.features.mobileFirst'),
      description: t('home.features.mobileFirstDesc'),
      color: 'from-gray-900 to-black',
    },
  ];

  const getIconClass = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'fa-qrcode': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      'fa-dollar-sign': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'fa-sync-alt': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      'fa-chart-line': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      'fa-headset': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'fa-mobile-alt': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    };
    return iconMap[iconName] || null;
  };

  return (
    <section id="features" className="py-32 bg-[#fcfcfd] relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/3 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className={`text-4xl md:text-5xl text-gray-900 mb-6 tracking-tight ${
            language === 'km' ? 'font-khmer text-khmer font-normal' : 'font-sans font-extrabold'
          }`}>
            {t('home.whyChooseUs')}
          </h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-8"></div>
          <p className={`text-lg text-gray-500 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
            {language === 'km' 
              ? 'អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីដំណើរការភោជនីយដ្ឋានទំនើប និងមានប្រសិទ្ធភាពក្នុងបណ្តាញតែមួយ។' 
              : 'Everything you need to run a modern, efficient restaurant in one platform.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card-premium group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-all duration-300 shadow-xl`}>
                {getIconClass(benefit.icon)}
              </div>
              <h3 className={`text-2xl font-bold text-gray-900 mb-4 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {benefit.title}
              </h3>
              <p className={`text-gray-500 leading-relaxed text-base ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {benefit.description}
              </p>
              
              <div className={`mt-8 flex items-center text-primary font-bold text-sm group-hover:translate-x-2 transition-transform duration-300 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {language === 'km' ? 'ស្វែងយល់បន្ថែម' : 'Learn more'}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
