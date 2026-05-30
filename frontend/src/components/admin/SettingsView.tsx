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
    logo: '',
    bakongAccountId: '',
    bakongMerchantName: '',
    bakongMerchantCity: ''
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
          logo: data.logo_url || data.logo || '',
          bakongAccountId: data.bakong_account_id || data.bakongAccountId || '',
          bakongMerchantName: data.bakong_merchant_name || data.bakongMerchantName || '',
          bakongMerchantCity: data.bakong_merchant_city || data.bakongMerchantCity || ''
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
      // Optimize image before upload (max 400x400 for logos to save storage)
      const optimizedFile = await optimizeImage(file, 400);
      
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* User Profile Image */}
          <div className="relative group mx-auto lg:mx-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                    // Optimize image (max 400x400 for profile pictures)
                    const optimizedFile = await optimizeImage(file, 400);
                    
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
                        setMessage({ type: 'success', text: language === 'km' ? 'រូបភាពត្រូវបានផ្លាស់ប្តូរ' : 'Profile image updated!' });
                      }
                    }
                  } catch (error) {
                    console.error('Upload failed:', error);
                    setMessage({ type: 'error', text: language === 'km' ? 'ការបញ្ចូលរូបភាពបរាជ័យ' : 'Failed to upload image' });
                  } finally {
                    setIsUploading(false);
                  }
                };
                input.click();
              }}
              className="absolute bottom-1 right-1 z-20 bg-primary text-white p-2.5 rounded-full shadow-md hover:scale-110 transition-transform active:scale-95 border-2 border-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* User Form Section */}
          <div className="flex-1 w-full space-y-6">
            <div>
              <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : 'Personal Profile'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
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
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* Logo Section */}
          <div className="relative group mx-auto lg:mx-0">
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
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
              className="absolute -bottom-2 -right-2 z-20 bg-primary text-white p-2.5 rounded-lg shadow-md hover:scale-110 transition-transform active:scale-95 border-2 border-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 w-full space-y-6">
            <div>
              <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'ការកំណត់ហាង' : 'Store Settings'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'ឈ្មោះហាង' : 'Store Name'}
                </label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="e.g. My Awesome Cafe"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'អាសយដ្ឋាន URL' : 'Store Slug'}
                </label>
                <input 
                  type="text" 
                  disabled
                  value={formData.slug}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="+855..."
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
                </label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="Street 123..."
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'ការពិពណ៌នា' : 'Description'}
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 min-h-[120px] ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="Tell us about your restaurant..."
                />
              </div>

              {/* Payment Settings */}
              <div className="md:col-span-2 pt-6 border-t border-gray-100 space-y-4">
                <div>
                  <h3 className={`text-lg font-bold text-gray-900 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Methods'}
                  </h3>
                  <p className={`text-xs text-gray-500 font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? 'វិធីសាស្ត្រដែលត្រូវបានទទួលយក' : 'Accepted Payment Methods'}
                  </p>
                </div>
                
                {/* Modern Clean Payment Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between transition-all hover:border-primary/30 hover:shadow-md cursor-pointer group">
                  <div className="flex items-center gap-4">
                    {/* Logo Box */}
                    <div className="w-12 h-12 bg-[#E1232E] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/images/KHQR Logo.png" alt="KHQR" className="w-8 h-8 object-contain" />
                    </div>
                    {/* Content */}
                    <div className="flex flex-col">
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest">KHQR</span>
                      <span className="text-gray-900 text-base font-bold uppercase tracking-tight">Bakong KHQR</span>
                      <span className={`text-gray-500 text-xs font-medium mt-0.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                        {language === 'km' ? 'ការទូទាត់តាម Bakong' : 'Bakong Payment'}
                      </span>
                    </div>
                  </div>
                  {/* Selected Indicator */}
                  <div className="w-6 h-6 bg-primary/10 border border-primary text-primary rounded-full flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'លេខគណនី KHQR' : 'KHQR Account ID'}
                </label>
                <input 
                  type="text" 
                  value={formData.bakongAccountId}
                  onChange={(e) => setFormData({ ...formData, bakongAccountId: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="e.g. username@bkrt · 085xxxxxx@abaa · 085xxxxxx@acba"
                />
                <p className={`text-[10px] text-gray-400 ml-1 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                  {language === 'km'
                    ? 'Bakong: username@bkrt · ABA: លេខទូរស័ព្ទ@abaa · ACLEDA: លេខទូរស័ព្ទ@acba'
                    : 'Bakong: username@bkrt · ABA: phonenumber@abaa · ACLEDA: phonenumber@acba'}
                </p>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'ឈ្មោះអាជីវកម្ម' : 'Merchant Name'}
                </label>
                <input 
                  type="text" 
                  value={formData.bakongMerchantName}
                  onChange={(e) => setFormData({ ...formData, bakongMerchantName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="e.g. Pizza House"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'ទីក្រុង' : 'Merchant City'}
                </label>
                <input 
                  type="text" 
                  value={formData.bakongMerchantCity}
                  onChange={(e) => setFormData({ ...formData, bakongMerchantCity: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}
                  placeholder="e.g. Phnom Penh"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className={`bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : ''}`}
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
