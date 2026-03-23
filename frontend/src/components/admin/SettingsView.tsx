'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
}

interface SettingsViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ language, t }) => {
  const { logout } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    logo: ''
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const storeId = localStorage.getItem('storeId');

      if (!storeId) {
        // No store assigned, show empty form
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/stores?id=${storeId}`);

      if (response.ok) {
        const data = await response.json();
        setStore(data);
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          logo: data.logo || data.logoUrl || ''
        });
        // Display logo if exists
        const logoToShow = data.logo || data.logoUrl;
        if (logoToShow) {
          setLogoPreview(logoToShow);
        }
        // Save store slug in localStorage for order URL
        if (data.slug) {
          localStorage.setItem('storeSlug', data.slug);
        }
      }
    } catch (error) {
      console.error('Failed to fetch store:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'qr-restaurant');
    formData.append('folder', 'store_logos');
    
    // Cloudinary transformation parameters for optimization
    formData.append('eager', 'w_400,h_400,c_fill,q_auto:good,f_auto'); // Resize to 400x400, auto quality, auto format
    formData.append('eager_async', 'true'); // Process asynchronously

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dpaq3ova2/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
      
      const data = await response.json();
      
      // Return optimized URL with transformations
      const publicId = data.public_id;
      const optimizedUrl = `https://res.cloudinary.com/dpaq3ova2/image/upload/w_400,h_400,c_fill,q_auto:good,f_auto/${publicId}`;
      
      return optimizedUrl;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const storeId = localStorage.getItem('storeId');

      let logoUrl = logoFile ? await uploadToCloudinary(logoFile) : (store?.logo || formData.logo || undefined);

      const response = await fetch(`/api/stores?id=${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          logoUrl: logoUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: language === 'km' ? 'ការកំណត់ត្រូវបានរក្សាទុក!' : 'Settings saved successfully!' });
        // Save store slug in localStorage for order URL
        if (data.store && data.store.slug) {
          localStorage.setItem('storeSlug', data.store.slug);
        }
        // Handle both logo and logoUrl fields
        const logoUrl = data.store?.logo || data.store?.logoUrl;
        if (logoUrl) {
          localStorage.setItem('storeLogo', logoUrl);
        }
        fetchStore();
        setLogoFile(null);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'ការកំណត់' : 'Settings'}
        </h2>
        <p className={`text-gray-600 mt-1 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'គ្រប់គ្រងព័ត៌មានភោជនីយដ្ឋានរបស់អ្នក' : 'Manage your restaurant information'}
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className={`block text-sm font-medium text-gray-700 mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'រូបភាពភោជនីយដ្ឋាន (Logo)' : 'Restaurant Logo'}
            </label>
            <div className="flex items-center gap-6">
              {logoPreview ? (
                <div key={logoPreview} className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                    className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-500 mt-2">{language === 'km' ? 'បង្ហោះ' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              )}
              <div>
                <p className={`text-sm text-gray-600 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' 
                    ? 'បង្ហោះរូបភាពភោជនីយដ្ឋានរបស់អ្នក។ វានឹងបង្ហាញនៅលើទំព័របញ្ជាទិញ។' 
                    : 'Upload your restaurant logo. It will be shown on the ordering page.'}
                </p>
                <p className="text-xs text-gray-500">
                  {language === 'km' ? 'ទំហំ៖ 500x500px (ល្អបំផុត)' : 'Size: 500x500px (recommended)'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className={`text-lg font-semibold mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'ព័ត៌មានភោជនីយដ្ឋាន' : 'Restaurant Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ឈ្មោះភោជនីយដ្ឋាន*' : 'Restaurant Name*'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'ឈ្មោះភោជនីយដ្ឋាន' : 'Restaurant name'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'Slug (URL - មិនអាចកែបាន)*' : 'Slug (URL - Read-only)*'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'នឹងបង្កើតស្វ័យប្រវត្តិ' : 'Auto-generated'}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'km' ? 'បង្កើតស្វ័យប្រវត្តិពីឈ្មោះភោជនីយដ្ឋាន' : 'Automatically generated from restaurant name'}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ការពិពណ៌នា' : 'Description'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  rows={3}
                  placeholder={language === 'km' ? 'ការពិពណ៌នាអំពីភោជនីយដ្ឋានរបស់អ្នក' : 'Describe your restaurant'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? '+855 12 345 678' : '+855 12 345 678'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'អាសយដ្ឋានភោជនីយដ្ឋាន' : 'Restaurant address'}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                logout();
              }}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
            >
              {language === 'km' ? 'ចាកចេញ' : 'Logout'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'km' ? 'រក្សាទុក' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
