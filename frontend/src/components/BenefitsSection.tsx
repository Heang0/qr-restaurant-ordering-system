'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const BenefitsSection: React.FC = () => {
  const { t, language } = useLanguage();

  const benefits = [
    {
      icon: 'qrcode',
      title: t('home.features.seamlessOrdering'),
      description: t('home.features.seamlessOrderingDesc'),
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
    },
    {
      icon: 'dollar',
      title: t('home.features.costEfficiency'),
      description: t('home.features.costEfficiencyDesc'),
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: 'sync',
      title: t('home.features.realTimeUpdates'),
      description: t('home.features.realTimeUpdatesDesc'),
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: 'analytics',
      title: t('home.features.analytics'),
      description: t('home.features.analyticsDesc'),
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: 'support',
      title: t('home.features.support'),
      description: t('home.features.supportDesc'),
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: 'mobile',
      title: t('home.features.mobileFirst'),
      description: t('home.features.mobileFirstDesc'),
      color: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50',
    },
  ];

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'qrcode': (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      'dollar': (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'sync': (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      'analytics': (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      'support': (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'mobile': (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    };
    return iconMap[iconName] || null;
  };

  return (
    <section id="features" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
            language === 'km' ? 'font-khmer' : 'font-sans'
          }`}>
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {t('home.whyChooseUs')}
            </span>
          </h2>
          <p className={`text-gray-600 text-base md:text-lg max-w-2xl mx-auto ${
            language === 'km' ? 'font-khmer' : 'font-sans'
          }`}>
            {language === 'km' 
              ? 'មូលហេតុដែល OrderHey ជាជម្រើសល្អបំផុតសម្រាប់ភោជនីយដ្ឋានរបស់អ្នក'
              : 'Why OrderHey is the best choice for your restaurant'}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover-lift border border-gray-100"
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${benefit.bg} rounded-2xl flex items-center justify-center ${benefit.color} text-white mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                {getIcon(benefit.icon)}
              </div>
              
              {/* Title */}
              <h3 className={`text-lg md:text-xl font-bold mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {benefit.title}
              </h3>
              
              {/* Description */}
              <p className={`text-gray-600 leading-relaxed text-sm md:text-base ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
