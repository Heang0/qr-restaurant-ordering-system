'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  isActive: boolean;
  created_at: string;
}

interface StoresViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const StoresView: React.FC<StoresViewProps> = ({ language, t }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/stores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStores(Array.isArray(data) ? data : (data.stores || []));
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStore(null);
    setFormData({ name: '', slug: '', description: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      slug: store.slug,
      description: store.description || '',
      isActive: store.isActive
    });
    setShowModal(true);
  };

  const filteredStores = (stores || []).filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStores = filteredStores.slice(startIndex, startIndex + itemsPerPage);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const autoSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    setFormData({ ...formData, name, slug: autoSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingStore ? `${API_BASE}/stores/${editingStore.id}` : `${API_BASE}/stores`;
      const response = await fetch(url, {
        method: editingStore ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowModal(false);
        fetchStores();
      }
    } catch (error) {}
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-6 w-20"><div className="h-3 w-4 bg-gray-100 rounded-full"></div></td>
      <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-50 rounded-2xl"></div><div className="space-y-2"><div className="h-4 w-32 bg-gray-100 rounded-full"></div><div className="h-3 w-48 bg-gray-50 rounded-full"></div></div></div></td>
      <td className="px-8 py-6"><div className="h-6 w-20 bg-gray-50 rounded-xl"></div></td>
      <td className="px-8 py-6 text-right"><div className="w-20 h-10 bg-gray-50 rounded-xl ml-auto"></div></td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងហាង' : 'Store Management'}
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 max-w-2xl">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'km' ? 'ស្វែងរកហាង...' : 'Search stores...'}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-all text-sm shadow-sm placeholder:text-gray-400 ${language === 'km' ? 'font-khmer' : ''}`}
            />
          </div>
          <button onClick={openCreateModal} className={`bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap w-full sm:w-auto ${language === 'km' ? 'font-khmer' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            <span>{language === 'km' ? 'បង្កើតថ្មី' : 'Create New'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto custom-scrollbar touch-pan-x">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest w-20 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ល.រ' : '#'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'អត្តសញ្ញាណហាង' : 'Store Identity'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'អាសយដ្ឋាន URL' : 'URL Slug'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest text-right ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <>{[...Array(itemsPerPage)].map((_, i) => <SkeletonRow key={i} />)}</>
              ) : paginatedStores.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">{searchQuery ? (language === 'km' ? 'មិនមានលទ្ធផល' : 'No stores found') : (language === 'km' ? 'មិនមានហាងទេ' : 'No stores registered yet')}</td></tr>
              ) : (
                paginatedStores.map((store, index) => (
                  <tr key={store.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6"><span className="text-xs font-black text-gray-300">{(currentPage - 1) * itemsPerPage + index + 1}</span></td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white overflow-hidden transition-all shadow-sm ring-2 ring-white ring-offset-2 ring-offset-gray-50">
                          {store.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                        </div>
                        <div>
                          <p className={`font-black text-gray-900 text-sm tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>{store.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">{store.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6"><span className="px-3 py-1.5 bg-gray-50 text-primary rounded-xl text-[10px] font-black italic">/{store.slug}</span></td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${store.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {store.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'មិនសកម្ម' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(store)} className="p-3 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowModal(false)} />
          <div className="relative flex-1 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h3 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {editingStore ? (language === 'km' ? 'កែសម្រួលហាង' : 'Edit Location') : (language === 'km' ? 'បង្កើតហាងថ្មី' : 'Register Location')}
                </h3>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-2"><label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ឈ្មោះហាង' : 'Store Name'}</label><input type="text" required value={formData.name} onChange={handleNameChange} className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all text-sm font-normal ${language === 'km' ? 'font-khmer' : 'font-sans'}`} placeholder={language === 'km' ? 'ឧទាហរណ៍៖ ហាងកាហ្វេរបស់ខ្ញុំ' : 'e.g. My Cafe'} /></div>
                <div className="space-y-2"><label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'អាសយដ្ឋាន URL' : 'URL Slug'}</label><input type="text" readOnly value={formData.slug} className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 font-bold text-primary italic text-sm" /></div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បោះបង់' : 'Cancel'}</button>
                <button type="submit" className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{editingStore ? (language === 'km' ? 'រក្សាទុក' : 'Save') : (language === 'km' ? 'បង្កើត' : 'Create')}</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresView;
