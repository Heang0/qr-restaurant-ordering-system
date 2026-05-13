'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface Category {
  id?: string;
  _id?: string;
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  order: number;
  isActive: boolean;
}

interface CategoriesViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ language, t }) => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameKm: '',
    description: '',
    descriptionKm: '',
    order: '0',
    isActive: true
  });
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      const response = await fetch(`/api/categories?storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      
      const url = editingCategory 
        ? `/api/categories/${getCategoryId(editingCategory)}`
        : '/api/categories';
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order),
          storeId: editingCategory ? undefined : storeId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(language === 'km' ? (editingCategory ? 'ប្រភេទត្រូវបានកែសម្រួល!' : 'ប្រភេទត្រូវបានបង្កើត!') : (editingCategory ? 'Category updated!' : 'Category created!'));
        setShowEditModal(false);
        setFormData({ name: '', nameKm: '', description: '', descriptionKm: '', order: '0', isActive: true });
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (error) {
      toast.error(language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      nameKm: category.nameKm || '',
      description: category.description || '',
      descriptionKm: category.descriptionKm || '',
      order: String(category.order || 0),
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setShowEditModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm(language === 'km' ? 'តើអ្នកចង់លុបមែនទេ?' : 'Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'km' ? 'ប្រភេទត្រូវបានលុប!' : 'Category deleted!');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const toggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const getCategoryId = (category: Category) => category.id || category._id || '';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងប្រភេទ' : 'Menu Structure'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Organize your menu catalog</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className={`bg-primary text-white px-6 py-4 rounded-2xl font-normal text-[14px] uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap w-full sm:w-auto ${language === 'km' ? 'font-khmer px-8' : 'font-sans'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតប្រភេទ' : 'Add Category'}</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent mx-auto"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
               {language === 'km' ? 'មិនមានប្រភេទទេ' : 'No categories structure found'}
            </p>
          </div>
        ) : (
          categories.map((category) => {
            const categoryId = getCategoryId(category);

            return (
            <div key={categoryId} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 group relative overflow-hidden flex flex-col p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${category.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {category.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'មិនសកម្ម' : 'Hidden')}
                   </div>
                   <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Priority #{category.order}</div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className={`text-xl text-gray-900 tracking-tight mb-2 group-hover:text-primary transition-colors ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' && category.nameKm ? category.nameKm : category.name}
                </h3>
                
                {(category.description || category.descriptionKm) && (
                  <p className={`text-xs text-gray-400 font-medium leading-relaxed ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' && category.descriptionKm ? category.descriptionKm : category.description}
                  </p>
                )}
              </div>

              <div className="mt-10 flex items-center gap-3">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 h-12 rounded-xl bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100"
                >
                  {language === 'km' ? 'កែសម្រួល' : 'Edit'}
                </button>
                <button
                  onClick={() => toggleActive(categoryId, category.isActive)}
                  className={`h-12 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    category.isActive 
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' 
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                   {category.isActive ? (language === 'km' ? 'បិទ' : 'Disable') : (language === 'km' ? 'បើក' : 'Enable')}
                </button>
                <button
                  onClick={() => handleDelete(categoryId)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all group/del shadow-sm border border-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 overflow-y-auto p-4 py-8">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden border border-white/10 animate-scaleIn">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                <h3 className={`text-xl text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' ? 'បង្កើតប្រភេទថ្មី' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="e.g., Main Dishes"
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameKm}
                    onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="ឧ. ម្ហូបចម្បង"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (អង់គ្លេស)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="Category description..."
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (ខ្មែរ)' : 'Description (Khmer)'}
                  </label>
                  <textarea
                    value={formData.descriptionKm}
                    onChange={(e) => setFormData({ ...formData, descriptionKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="ការពិពណ៌នា..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'លំដាប់' : 'Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'km' ? 'លេខតូចបង្ហាញមុន' : 'Lower number shows first'}
                  </p>
                </div>
                <div className="flex items-center pt-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <label htmlFor="isActive" className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {language === 'km' ? 'ប្រភេទសកម្ម' : 'Category is active'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 px-6 py-4 border border-gray-200 bg-white rounded-2xl text-[13px] font-normal uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {language === 'km' ? 'បង្កើត' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 overflow-y-auto p-4 py-8">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden border border-white/10 animate-scaleIn">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                <h3 className={`text-xl text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' ? 'កែសម្រួលប្រភេទ' : 'Edit Category'}
                </h3>
                <button
                  onClick={() => { setShowEditModal(false); setEditingCategory(null); }}
                  className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="e.g., Main Dishes"
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameKm}
                    onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="ឧ. ម្ហូបចម្បង"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (អង់គ្លេស)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="Category description..."
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (ខ្មែរ)' : 'Description (Khmer)'}
                  </label>
                  <textarea
                    value={formData.descriptionKm}
                    onChange={(e) => setFormData({ ...formData, descriptionKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="ការពិពណ៌នា..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'លំដាប់' : 'Order'}
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActiveEdit"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <label htmlFor="isActiveEdit" className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {language === 'km' ? 'ប្រភេទសកម្ម' : 'Category is active'}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4 shrink-0">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingCategory(null); }}
                className={`flex-1 px-6 py-4 border border-gray-200 bg-white rounded-2xl text-[13px] font-normal uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'km' ? 'រក្សាទុក' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};

export default CategoriesView;
