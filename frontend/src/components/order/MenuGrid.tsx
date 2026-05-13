'use client';

import React from 'react';
import { MenuItem } from '@/types';

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
    if (!category) return language === 'km' ? 'ទាំងអស់' : 'All';
    if (typeof category === 'string') return category;
    const cat = category as { name: string; nameKm?: string };
    return language === 'km' && cat.nameKm ? cat.nameKm : cat.name;
  };

  const getCategoryIcon = (id: string, isActive: boolean) => {
    const icons: Record<string, JSX.Element> = {
      'all': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      'burger': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.5c0 1.93-1.57 3.5-3.5 3.5H6.5c-1.93 0-3.5-1.57-3.5-3.5V14h18v1.5zM3 10.5c0-1.93 1.57-3.5 3.5-3.5h11c1.93 0 3.5 1.57 3.5 3.5V12H3v-1.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7V5.5C7 4.12 8.12 3 9.5 3h5C15.88 3 17 4.12 17 5.5V7M3 12h18v2H3v-2z" />
        </svg>
      ),
      'pizza': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3L2 12h3v8h14v-8h3L12 3z" />
        </svg>
      ),
      'drink': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
        </svg>
      ),
      'dessert': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.5a3.5 3.5 0 01-7 0V7h7v8.5zM3 15.5a3.5 3.5 0 017 0V7H3v8.5z" />
        </svg>
      ),
      'asian': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      'healthy': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l1.912 5.886H20.09l-4.994 3.63 1.91 5.884-4.996-3.63-4.996 3.63 1.91-5.884-4.994-3.63h6.178L12 3z" />
        </svg>
      ),
    };
    const foundKey = Object.keys(icons).find(k => id.toLowerCase().includes(k)) || 'asian';
    return icons[foundKey];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className={`text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ${language === 'km' ? 'font-khmer' : ''}`}>
          {language === 'km' ? 'កំពុងរៀបចំ...' : 'Loading Menu...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto group px-1">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={language === 'km' ? 'ស្វែងរកមុខម្ហូប...' : 'Search for dishes...'}
          className={`w-full pl-16 pr-6 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl shadow-sm focus:shadow-xl focus:shadow-primary/5 focus:border-primary focus:bg-white outline-none transition-all duration-500 text-[14px] font-medium text-gray-900 placeholder-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
        />
      </div>

      {/* Categories */}
      <div className="sticky top-0 z-30 -mx-5 px-5 bg-[#fcfcfd]/80 backdrop-blur-xl pb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className={`text-[13px] font-semibold text-gray-500 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'}
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x -mx-5 px-5">
          {categories.map((category) => {
            const categoryId = typeof category === 'object' ? String(category.id || category._id) : String(category);
            const isActive = selectedCategory === categoryId;
            return (
              <button
                key={categoryId}
                onClick={() => onCategoryChange(categoryId)}
                className={`snap-start flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-500 whitespace-nowrap border ${
                  isActive 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary shadow-sm'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-primary'}`}>
                  {getCategoryIcon(categoryId, isActive)}
                </span>
                <span className={`text-[12px] font-semibold uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
                  {getCategoryName(category)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid - 2 columns on mobile, 4 on tablet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300 overflow-hidden relative"
          >
            {/* Image Section */}
            <div 
              className="relative aspect-square overflow-hidden cursor-pointer"
              onClick={() => onImageClick?.(item)}
            >
              {item.imageUrl || item.image ? (
                <img
                  src={item.imageUrl || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {item.isPopular && (
                <div className="absolute top-2 left-2">
                  <div className="bg-primary/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[8px] font-semibold text-white uppercase tracking-wider">
                    Best Seller
                  </div>
                </div>
              )}

              {!item.isAvailable && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <span className="px-3 py-1 bg-gray-900/80 text-white rounded-lg text-[9px] font-semibold uppercase tracking-wider">
                    {language === 'km' ? 'អស់ហើយ' : 'Sold Out'}
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-3 flex flex-col flex-1">
              <h3 className={`text-[13px] font-semibold text-gray-900 leading-snug mb-1 line-clamp-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' && item.nameKm ? item.nameKm : item.name}
              </h3>

              {(item.description || item.descriptionKm) && (
                <p className={`text-[10px] text-gray-400 line-clamp-1 mb-3 leading-tight ${language === 'km' ? 'font-khmer' : 'font-normal'}`}>
                  {language === 'km' && item.descriptionKm ? item.descriptionKm : item.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between">
                <span className="text-[14px] font-semibold text-gray-900 tracking-tight">${item.price.toFixed(2)}</span>
                
                <button
                  onClick={() => onAddToCart(item, 1)}
                  disabled={!item.isAvailable}
                  className="w-8 h-8 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300 disabled:opacity-5 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6">
             <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <h3 className={`text-lg font-medium text-gray-900 mb-2 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'រកមិនឃើញមុខម្ហូបទេ' : 'No matches found'}
          </h3>
        </div>
      )}
    </div>
  );
};

export default MenuGrid;
