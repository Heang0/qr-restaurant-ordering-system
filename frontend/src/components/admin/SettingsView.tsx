'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { optimizeImage } from '@/utils/imageOptimizer';

interface Store {
  id: string;
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
  const { profileImage, updateProfileImage } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    logo: ''
  });

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      
      if (!storeId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/stores/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStore(data);
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          address: data.address || '',
          phone: data.phone || '',
          logo: data.logo_url || data.logo || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // Optimize image before upload
      const optimizedFile = await optimizeImage(file);
      
      const formData = new FormData();
      formData.append('file', optimizedFile);
      const token = localStorage.getItem('token');
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        const storeId = localStorage.getItem('storeId');
        const updateRes = await fetch(`/api/stores/${storeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ logo: uploadData.url })
        });
        if (updateRes.ok) {
          setFormData(prev => ({ ...prev, logo: uploadData.url }));
          setMessage({ type: 'success', text: language === 'km' ? 'រូបភាពត្រូវបានរក្សាទុក!' : 'Logo updated successfully!' });
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      
      if (!storeId) {
        console.error('No storeId found in localStorage');
        setMessage({ type: 'error', text: 'Store ID missing. Please log in again.' });
        setSaving(false);
        return;
      }

      console.log('Saving store settings for ID:', storeId, 'Data:', formData);
      
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('Save response:', result);

      if (response.ok) {
        setMessage({ type: 'success', text: language === 'km' ? 'ការកំណត់ត្រូវបានរក្សាទុក!' : 'Settings saved successfully!' });
        
        // Update store name in localStorage and trigger global update event
        if (formData.name) {
          localStorage.setItem('storeName', formData.name);
          window.dispatchEvent(new Event('storeUpdate'));
        }
        
        fetchStore();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border animate-slideIn ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={message.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
            </div>
            <span className={`font-normal ${language === 'km' ? 'font-khmer' : 'font-sans font-bold'}`}>{message.text}</span>
          </div>
        </div>
      )}

      {/* User Profile Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-10">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* User Profile Image */}
          <div className="relative group mx-auto lg:mx-0">
            <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gray-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e: any) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  try {
                    // Optimize image
                    const optimizedFile = await optimizeImage(file);
                    
                    const formData = new FormData();
                    formData.append('file', optimizedFile);
                    const token = localStorage.getItem('token');
                    const uploadRes = await fetch('/api/upload', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: formData
                    });
                    const uploadData = await uploadRes.json();
                    if (uploadData.url) {
                      const userId = localStorage.getItem('userId');
                      const updateRes = await fetch(`/api/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ profile_image: uploadData.url })
                      });
                      if (updateRes.ok) {
                        updateProfileImage(uploadData.url);
                        setMessage({ type: 'success', text: language === 'km' ? 'រូបភាពប្រវត្តិរូបត្រូវបានរក្សាទុក!' : 'Profile image updated!' });
                      }
                    }
                  } catch (error) {
                    console.error('Upload failed:', error);
                  } finally {
                    setIsUploading(false);
                  }
                };
                input.click();
              }}
              className="absolute bottom-2 right-2 z-20 bg-primary text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </button>
          </div>

          {/* User Form Section */}
          <div className="flex-1 w-full space-y-8">
            <div>
              <h2 className={`text-2xl font-black text-gray-900 mb-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {language === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : 'Personal Profile'}
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Manage your account identity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px] font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}
                </label>
                <input 
                  type="text" 
                  defaultValue={localStorage.getItem('fullName') || ''} 
                  onBlur={async (e) => {
                    const fullName = e.target.value;
                    const token = localStorage.getItem('token');
                    const userId = localStorage.getItem('userId');
                    await fetch(`/api/users/${userId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ full_name: fullName })
                    });
                    localStorage.setItem('fullName', fullName);
                  }}
                  className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-normal text-gray-900 ${language === 'km' ? 'font-khmer text-lg' : 'font-sans'}`}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-10">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Logo Section */}
          <div className="relative group mx-auto lg:mx-0">
            <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-gray-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                  </svg>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 z-20 bg-primary text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-8">
            <div>
              <h2 className={`text-2xl font-black text-gray-900 mb-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {language === 'km' ? 'ការកំណត់ហាង' : 'Store Settings'}
              </h2>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Identify your digital presence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px] font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'ឈ្មោះហាង' : 'Store Name'}
                </label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-normal text-gray-900 ${language === 'km' ? 'font-khmer text-lg' : 'font-sans'}`}
                  placeholder="e.g. My Awesome Cafe"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px] font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'អាសយដ្ឋាន URL' : 'Store Slug'}
                </label>
                <input 
                  type="text" 
                  disabled
                  value={formData.slug}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px] font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-normal text-gray-900 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder="+855..."
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px] font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
                </label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-normal text-gray-900 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder="Street 123..."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px] font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'ការពិពណ៌នា' : 'Description'}
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-normal text-gray-900 min-h-[120px] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder="Tell us about your restaurant..."
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className={`bg-primary text-white px-10 py-5 rounded-2xl font-normal text-[13px] uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            >
              {saving ? (language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...') : (language === 'km' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
