'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import ModalPortal from '@/components/Portal';

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
    const isAnyModalOpen = showCreateModal || showEditModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent touch move on body for iOS
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [showCreateModal, showEditModal]);

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
        setShowCreateModal(false);
        setFormData({ name: '', nameKm: '', description: '', descriptionKm: '', order: '0', isActive: true });
        setEditingCategory(null);
        fetchCategories();
      } else {
        if (data.message === 'PLAN_LIMIT_REACHED') {
          toast.error(language === 'km' ? 'ឈានដល់ដែនកំណត់! សូមដំឡើងកញ្ចប់សេវាកម្មរបស់អ្នក។' : 'Limit Reached! Please upgrade your plan in the Billing tab.');
        } else {
          toast.error(data.message || 'Failed to save category');
        }
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
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងប្រភេទ' : 'Menu Structure'}
          </h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className={`bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto ${language === 'km' ? 'font-khmer' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតប្រភេទ' : 'Add Category'}</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary border-t-transparent mx-auto"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <p className="text-gray-500 font-semibold text-sm">
               {language === 'km' ? 'មិនមានប្រភេទទេ' : 'No categories structure found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ឈ្មោះ' : 'Name'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'អាទិភាព' : 'Priority'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className={`px-6 py-4 text-right ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => {
                  const categoryId = getCategoryId(category);
                  return (
                    <tr key={categoryId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className={`text-sm font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' && category.nameKm ? category.nameKm : category.name}
                        </p>
                        {(category.description || category.descriptionKm) && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[250px]">
                            {language === 'km' && category.descriptionKm ? category.descriptionKm : category.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">#{category.order}</span>
                      </td>
                      <td className="px-6 py-4">
                         <button
                           onClick={() => toggleActive(categoryId, category.isActive)}
                           className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                             category.isActive
                               ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                               : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                           }`}
                         >
                           <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                           {category.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'មិនសកម្ម' : 'Hidden')}
                         </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              title="Edit"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(categoryId)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowCreateModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                  <h3 className={`text-lg text-gray-900 font-bold ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? 'បង្កើតប្រភេទ' : 'Create Category'}
                  </h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-white">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-xs font-semibold text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                          placeholder="e.g., Beverages"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                        </label>
                        <input
                          type="text"
                          value={formData.nameKm}
                          onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm ${language === 'km' ? 'font-khmer' : ''}`}
                          placeholder="ឧ. ភេសជ្ជៈ"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'អាទិភាព (លំដាប់)*' : 'Priority (Order)*'}
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <label htmlFor="isActive" className={`text-sm font-bold text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'បើកដំណើរការ' : 'Active Status'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                    >
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                    >
                      {language === 'km' ? 'រក្សាទុក' : 'Save'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => { setShowEditModal(false); setEditingCategory(null); }}
          />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                  <h3 className={`text-lg text-gray-900 font-bold ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? 'កែប្រែប្រភេទ' : 'Edit Category'}
                  </h3>
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingCategory(null); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-white">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-xs font-semibold text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                        </label>
                        <input
                          type="text"
                          value={formData.nameKm}
                          onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm ${language === 'km' ? 'font-khmer' : ''}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-semibold text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'អាទិភាព (លំដាប់)*' : 'Priority (Order)*'}
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="isActiveEdit"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <label htmlFor="isActiveEdit" className={`text-sm font-bold text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'បើកដំណើរការ' : 'Active Status'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => { setShowEditModal(false); setEditingCategory(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                    >
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                    >
                      {language === 'km' ? 'រក្សាទុក' : 'Save'}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default CategoriesView;
