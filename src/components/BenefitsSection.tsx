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
      color: 'from-green-500 to-green-600',
    },
    {
      icon: 'fa-sync-alt',
      title: t('home.features.realTimeUpdates'),
      description: t('home.features.realTimeUpdatesDesc'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: 'fa-chart-line',
      title: t('home.features.analytics'),
      description: t('home.features.analyticsDesc'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: 'fa-headset',
      title: t('home.features.support'),
      description: t('home.features.supportDesc'),
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: 'fa-mobile-alt',
      title: t('home.features.mobileFirst'),
      description: t('home.features.mobileFirstDesc'),
      color: 'from-pink-500 to-pink-600',
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
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-bold text-center mb-16 ${
          language === 'km' ? 'font-khmer text-khmer' : 'font-sans'
        }`}>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('home.whyChooseUs')}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-lift border border-gray-100"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {getIconClass(benefit.icon)}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {benefit.title}
              </h3>
              <p className={`text-gray-600 leading-relaxed ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
