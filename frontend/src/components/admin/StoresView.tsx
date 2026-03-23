'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface StoresViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const StoresView: React.FC<StoresViewProps> = ({ language, t }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
    setFormData({ ...formData, name, slug: autoSlug });
  };
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: language === 'km' ? 'ហាងត្រូវបានបង្កើត!' : 'Store created successfully!' });
        setShowCreateModal(false);
        setFormData({ name: '', slug: '', description: '', isActive: true });
        fetchStores();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create store' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred' });
    }
  };

  const handleDelete = async (storeId: string) => {
    if (!confirm(language === 'km' ? 'តើអ្នកចង់លុបមែនទេ?' : 'Are you sure you want to delete?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/stores/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: language === 'km' ? 'ហាងត្រូវបានលុប!' : 'Store deleted!' });
        fetchStores();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete store' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'ការគ្រប់គ្រងហាង' : 'Store Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'km' ? 'បង្កើតហាង' : 'Create Store'}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              {language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading...'}
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className={language === 'km' ? 'font-khmer' : 'font-sans'}>
              {language === 'km' ? 'មិនមានហាងទេ' : 'No stores found'}
            </p>
          </div>
        ) : (
          stores.map((store) => (
            <div key={store._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all card-hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${store.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {store.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'មិនសកម្ម' : 'Inactive')}
                </span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{store.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Slug: {store.slug}</p>
              {store.description && (
                <p className={`text-sm text-gray-600 mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{store.description}</p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">{new Date(store.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDelete(store._id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title={language === 'km' ? 'លុប' : 'Delete'}
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

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'បង្កើតហាងថ្មី' : 'Create New Store'}
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
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ឈ្មោះហាង*' : 'Store Name*'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'ឈ្មោះហាងរបស់អ្នក' : 'Your store name'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'Slug (URL - បង្កើតស្វ័យប្រវត្តិ)' : 'Slug (URL - Auto-generated)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'នឹងបង្កើតស្វ័យប្រវត្តិ' : 'Will be auto-generated'}
                  readOnly
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ការពិពណ៌នា' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  rows={3}
                  placeholder={language === 'km' ? 'ការពិពណ៌នាអំពីហាង (មិនបាច់ក៏បាន)' : 'Store description (optional)'}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ហាងសកម្ម' : 'Store is active'}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
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
    </div>
  );
};

export default StoresView;
