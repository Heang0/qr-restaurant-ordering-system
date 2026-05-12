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
    if (typeof category === 'string') return category;
    if (typeof category === 'object') {
      return language === 'km' && category.nameKm ? category.nameKm : category.name;
    }
    return String(category);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loading Menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 px-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-center shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Bar - App Style */}
      <div className="relative group max-w-2xl mx-auto w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('order.searchPlaceholder')}
          className={`w-full pl-12 pr-5 py-4 rounded-[1.25rem] bg-white border border-gray-100 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 text-sm font-bold text-gray-900 placeholder-gray-300 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
        />
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide snap-x">
          {categories.map((category) => {
            const categoryId = typeof category === 'object' ? String(category.id) : String(category);
            const isActive = selectedCategory === categoryId;
            return (
              <button
                key={categoryId}
                onClick={() => onCategoryChange(categoryId)}
                className={`snap-start h-12 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest whitespace-nowrap transition-all duration-500 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20'
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                } ${language === 'km' ? 'font-khmer font-bold text-[13px] normal-case tracking-normal' : 'font-sans'}`}
              >
                {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>}
                <span className="relative z-10">{getCategoryName(category)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid - High End Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col bg-white rounded-[2.5rem] p-3 border border-gray-100/50 shadow-sm hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500 hover:-translate-y-2"
          >
            {/* Image Container */}
            <div 
              className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gray-50 cursor-pointer mb-4"
              onClick={() => onImageClick?.(item)}
            >
              {item.imageUrl || item.image ? (
                <img
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Status Tags */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {!item.isAvailable && (
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest shadow-xl">
                    {language === 'km' ? 'អស់' : 'Sold Out'}
                  </div>
                )}
              </div>

              {/* Quick View Button */}
              <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="px-2 pb-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-black text-gray-900 line-clamp-1 ${language === 'km' ? 'font-khmer font-bold text-[15px]' : 'font-sans'}`}>
                  {language === 'km' && item.nameKm ? item.nameKm : item.name}
                </h3>
              </div>
              
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 line-clamp-1">
                {language === 'km' ? (item.name || 'Delicious Choice') : (item.nameKm || 'Freshly Prepared')}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Price</span>
                  <span className="text-lg font-black text-gray-900 tracking-tight">${item.price.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={() => onAddToCart(item, 1)}
                  disabled={!item.isAvailable}
                  className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 active:scale-90 transition-all duration-300 disabled:opacity-30 disabled:grayscale"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 animate-fadeIn">
          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className={`text-lg font-black text-gray-900 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
            {language === 'km' ? 'មិនមានទិន្នន័យ' : 'No Items Found'}
          </h4>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;
