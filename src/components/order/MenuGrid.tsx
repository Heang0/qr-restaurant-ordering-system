'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface MenuGridProps {
  items: MenuItem[];
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  isLoading: boolean;
  error: string;
  language: 'en' | 'km';
  t: (key: string) => string;
  onImageClick?: (item: MenuItem) => void;
}

const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onAddToCart,
  isLoading,
  error,
  language,
  t,
  onImageClick,
}) => {
  const getCategoryName = (category: any) => {
    if (!category) return t('common.all');
    
    // If category is a string (ID only), return it
    if (typeof category === 'string') {
      return category;
    }
    
    // If category is an object, return name based on language
    if (typeof category === 'object') {
      return language === 'km' && category.nameKm 
        ? category.nameKm 
        : category.name;
    }
    
    return String(category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-medium py-20">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('order.searchPlaceholder')}
          className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm text-gray-700 placeholder-gray-400 shadow-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
        />
      </div>

      {/* Category Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((category) => {
          const categoryId = typeof category === 'object' ? String(category._id) : String(category);
          return (
            <button
              key={categoryId}
              onClick={() => onCategoryChange(categoryId)}
              className={`h-12 px-5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 btn-hover-lift ${
                selectedCategory === categoryId
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary'
              } ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            >
              {getCategoryName(category)}
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 card-hover-lift border border-gray-100"
          >
            {/* Image */}
            <div 
              className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onImageClick) {
                  onImageClick(item);
                }
              }}
            >
              {item.imageUrl || item.image ? (
                <img
                  src={item.imageUrl || item.image}
                  alt={language === 'km' && item.nameKm ? item.nameKm : item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Click hint overlay */}
              {(item.imageUrl || item.image) && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              )}
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    {language === 'km' ? 'អស់' : 'Sold Out'}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-2.5">
              <h3 className={`font-semibold text-sm mb-0.5 truncate ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' && item.nameKm ? item.nameKm : item.name}
              </h3>
              {language === 'km' && item.nameKm && (
                <p className="text-xs text-gray-400 font-sans truncate mb-1">{item.name}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-primary font-bold text-sm">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => onAddToCart(item, 1)}
                  disabled={!item.isAvailable}
                  className="w-7 h-7 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={language === 'km' ? 'font-khmer' : 'font-sans'}>
            {language === 'km' ? 'មិនមានមុខម្ហូបទេ' : 'No items found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;
