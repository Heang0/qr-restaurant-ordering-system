'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmptyStateProps {
  type: 'menu' | 'categories' | 'orders' | 'tables' | 'users';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const { language } = useLanguage();

  const content = {
    menu: {
      en: {
        title: 'No Menu Items Yet',
        description: 'Start creating your menu by adding your first item!',
        action: 'Add Menu Item'
      },
      km: {
        title: 'មិនមានមុខម្ហូបទេ',
        description: 'ចាប់ផ្តើមបង្កើតម៉ឺនុយរបស់អ្នកដោយបន្ថែមមុខម្ហូបដំបូង!',
        action: 'បន្ថែមមុខម្ហូប'
      }
    },
    categories: {
      en: {
        title: 'No Categories Yet',
        description: 'Organize your menu by creating your first category!',
        action: 'Add Category'
      },
      km: {
        title: 'មិនមានប្រភេទទេ',
        description: 'រៀបចំម៉ឺនុយរបស់អ្នកដោយបង្កើតប្រភេទដំបូង!',
        action: 'បន្ថែមប្រភេទ'
      }
    },
    orders: {
      en: {
        title: 'No Orders Yet',
        description: 'Orders will appear here when customers start ordering!',
        action: null
      },
      km: {
        title: 'មិនមានការបញ្ជាទិញទេ',
        description: 'ការបញ្ជាទិញនឹងលេចឡើងនៅទីនេះនៅពេលអតិថិជនចាប់ផ្តើមបញ្ជា!',
        action: null
      }
    },
    tables: {
      en: {
        title: 'No Tables Yet',
        description: 'Add your restaurant tables to start taking orders!',
        action: 'Add Table'
      },
      km: {
        title: 'មិនមានតុទេ',
        description: 'បន្ថែមតុភោជនីយដ្ឋានរបស់អ្នកដើម្បីចាប់ផ្តើមទទួលការបញ្ជា!',
        action: 'បន្ថែមតុ'
      }
    },
    users: {
      en: {
        title: 'No Users Yet',
        description: 'Create your first user to manage your restaurant!',
        action: 'Add User'
      },
      km: {
        title: 'មិនមានអ្នកប្រើទេ',
        description: 'បង្កើតអ្នកប្រើដំបូងរបស់អ្នកដើម្បីគ្រប់គ្រងភោជនីយដ្ឋានរបស់អ្នក!',
        action: 'បន្ថែមអ្នកប្រើ'
      }
    }
  };

  const t = content[type][language];

  return (
    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Illustration */}
      <div className="mb-6">
        {type === 'menu' && (
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
        {type === 'categories' && (
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )}
        {type === 'orders' && (
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {type === 'tables' && (
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        )}
        {type === 'users' && (
          <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>

      {/* Text */}
      <h3 className={`text-lg font-semibold text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
        {t.title}
      </h3>
      <p className={`text-sm text-gray-500 mb-6 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
        {t.description}
      </p>

      {/* Action button will be rendered by parent component if needed */}
      <div data-empty-state-action />
    </div>
  );
};
