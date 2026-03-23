'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface Category {
  _id: string;
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
        ? `/api/categories/${editingCategory._id}`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={`text-2xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'ការគ្រប់គ្រងប្រភេទ' : 'Category Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'km' ? 'បង្កើតប្រភេទ' : 'Add Category'}
        </button>
      </div>
{/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className={`text-lg font-medium mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'មិនមានប្រភេទទេ' : 'No categories yet'}
            </p>
            <p className={`text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'ចាប់ផ្តើមបង្កើតប្រភេទសម្រាប់ម៉ឺនុយរបស់អ្នក!' : 'Start creating categories for your menu!'}
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all card-hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {category.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'មិនសកម្ម' : 'Inactive')}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                    #{category.order}
                  </span>
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-1 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' && category.nameKm ? category.nameKm : category.name}
              </h3>
              
              {language === 'km' && category.nameKm && (
                <p className="text-sm text-gray-500 font-sans mb-2">{category.name}</p>
              )}

              {(category.description || category.descriptionKm) && (
                <p className={`text-sm text-gray-600 mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' && category.descriptionKm ? category.descriptionKm : category.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  {language === 'km' ? 'កែសម្រួល' : 'Edit'}
                </button>
                <button
                  onClick={() => toggleActive(category._id, category.isActive)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category.isActive 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {category.isActive ? (language === 'km' ? 'ធ្វើឱ្យមិនសកម្ម' : 'Deactivate') : (language === 'km' ? 'ធ្វើឱ្យសកម្ម' : 'Activate')}
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'បង្កើតប្រភេទថ្មី' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                <div className="flex items-center">
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

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {language === 'km' ? 'បង្កើត' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'កែសម្រួលប្រភេទ' : 'Edit Category'}
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingCategory(null); }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
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

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingCategory(null); }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {language === 'km' ? 'កែសម្រួល' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView;
