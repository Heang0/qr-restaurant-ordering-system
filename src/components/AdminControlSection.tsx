'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminControlSection: React.FC = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: 'dashboard',
      title: t('home.adminFeatures.dashboard'),
      description: t('home.adminFeatures.dashboardDesc'),
    },
    {
      icon: 'menu',
      title: t('home.adminFeatures.menuManagement'),
      description: t('home.adminFeatures.menuManagementDesc'),
    },
    {
      icon: 'orders',
      title: t('home.adminFeatures.orderTracking'),
      description: t('home.adminFeatures.orderTrackingDesc'),
    },
    {
      icon: 'staff',
      title: t('home.adminFeatures.staffManagement'),
      description: t('home.adminFeatures.staffManagementDesc'),
    },
    {
      icon: 'table',
      title: t('home.adminFeatures.tableManagement'),
      description: t('home.adminFeatures.tableManagementDesc'),
    },
    {
      icon: 'reports',
      title: t('home.adminFeatures.reports'),
      description: t('home.adminFeatures.reportsDesc'),
    },
  ];

  const getIconClass = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'dashboard': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'menu': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      'orders': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'staff': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'table': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      'reports': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    };
    return iconMap[iconName] || null;
  };

  return (
    <section id="admin-control" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4 ${
          language === 'km' ? 'font-khmer text-khmer' : 'font-sans'
        }`}>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('home.adminControl')}
          </span>
        </h2>
        <p className={`text-center text-gray-600 text-lg mb-16 max-w-3xl mx-auto ${
          language === 'km' ? 'font-khmer' : 'font-sans'
        }`}>
          {t('home.adminControlDesc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-lift border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                {getIconClass(feature.icon)}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {feature.title}
              </h3>
              <p className={`text-gray-600 leading-relaxed ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminControlSection;
