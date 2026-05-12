'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: string;
  email: string;
  role: string;
  store_id?: string;
  full_name?: string;
  profile_image?: string;
  created_at: string;
}

interface Store {
  id: string;
  name: string;
}

interface UsersViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const UsersView: React.FC<UsersViewProps> = ({ language, t }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
    storeId: '',
    full_name: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : (data.users || []));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
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
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', role: 'admin', storeId: '', full_name: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: 'admin',
      storeId: user.store_id || '',
      full_name: user.full_name || ''
    });
    setShowModal(true);
  };

  const filteredUsers = (users || []).filter(user => 
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(paginatedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const url = editingUser ? `${API_BASE}/users/${editingUser.id}` : `${API_BASE}/users`;
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, role: 'admin' })
      });
      if (response.ok) {
        setShowModal(false);
        fetchUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-5 w-10"><div className="h-4 w-4 bg-gray-50 rounded"></div></td>
      <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-gray-50"></div><div className="space-y-2"><div className="h-4 w-24 bg-gray-100 rounded-full"></div><div className="h-3 w-32 bg-gray-50 rounded-full"></div></div></div></td>
      <td className="px-8 py-5"><div className="h-4 w-24 bg-gray-100 rounded-full"></div></td>
      <td className="px-8 py-5"><div className="h-6 w-16 bg-gray-50 rounded-lg"></div></td>
      <td className="px-8 py-5 text-right"><div className="w-20 h-9 bg-gray-50 rounded-xl ml-auto"></div></td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-full relative">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់' : 'User Management'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">System Operators</p>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'km' ? 'ស្វែងរកអ្នកប្រើប្រាស់...' : 'Search operators...'}
              className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-normal text-sm shadow-sm placeholder:font-normal placeholder:text-gray-300 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            />
          </div>

          <button onClick={openCreateModal} className={`bg-primary text-white px-6 py-4 rounded-2xl font-normal text-[14px] uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap w-full sm:w-auto ${language === 'km' ? 'font-khmer px-8' : 'font-sans'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតថ្មី' : 'Create New'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden animate-fadeIn relative">
        <div className="overflow-x-auto custom-scrollbar touch-pan-x">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 w-10">
                  <input type="checkbox" checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary transition-all cursor-pointer" />
                </th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'អ្នកប្រតិបត្តិ' : 'Operator'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ហាង' : 'Store'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'សិទ្ធិប្រើប្រាស់' : 'Access Role'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest text-right ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <>{[...Array(itemsPerPage)].map((_, i) => <SkeletonRow key={i} />)}</>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold">{searchQuery ? (language === 'km' ? 'មិនមានលទ្ធផល' : 'No operators found') : (language === 'km' ? 'មិនមានអ្នកប្រើប្រាស់ទេ' : 'No operators registered yet')}</td></tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedUserIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-8 py-5"><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary transition-all cursor-pointer" /></td>
                    <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 ring-2 ring-white ring-offset-2 ring-offset-gray-50 group-hover:ring-primary/20 transition-all shadow-sm">{user.profile_image ? <img src={user.profile_image} alt="PF" className="w-full h-full object-cover" /> : <span className="font-black text-sm uppercase">{user.email.charAt(0)}</span>}</div><div><p className={`font-bold text-gray-900 text-sm ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>{user.full_name || 'No Name'}</p><p className="text-[10px] text-gray-400 font-bold">{user.email}</p></div></div></td>
                    <td className="px-8 py-5"><span className={`text-xs font-bold text-gray-600 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>{user.store_id ? (stores.find(s => s.id === user.store_id)?.name || 'Linked Store') : '--'}</span></td>
                    <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{user.role}</span></td>
                    <td className="px-8 py-5 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEditModal(user)} className="p-2.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-90 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-50 flex-shrink-0">
              <div><h3 className={`text-lg text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{editingUser ? (language === 'km' ? 'កែសម្រួលអ្នកគ្រប់គ្រង' : 'Edit Manager') : (language === 'km' ? 'បង្កើតអ្នកគ្រប់គ្រងថ្មី' : 'New Manager')}</h3></div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-2"><label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}</label><input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all font-normal text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`} /></div>
                <div className="space-y-2"><label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all font-normal text-sm" /></div>
                {!editingUser && <div className="space-y-2"><label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'}</label><input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all font-normal text-sm" /></div>}
                <div className="space-y-2 animate-fadeIn"><label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ចាត់តាំងទៅហាង' : 'Assign to Store'}</label><select required value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all font-normal text-sm text-primary ${language === 'km' ? 'font-khmer' : 'font-sans'}`}><option value="" className="font-normal">{language === 'km' ? '--- ជ្រើសរើសហាង ---' : '--- Select Store ---'}</option>{stores.map(s => <option key={s.id} value={s.id} className="font-normal">{s.name}</option>)}</select></div>
              </div>
              <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 px-6 py-4 bg-white text-gray-500 border border-gray-200 rounded-xl uppercase text-[13px] font-normal ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បោះបង់' : 'Cancel'}</button>
                <button type="submit" className={`flex-1 px-6 py-4 bg-primary text-white rounded-xl uppercase text-[13px] shadow-lg shadow-primary/20 font-normal ${language === 'km' ? 'font-khmer' : ''}`}>{editingUser ? (language === 'km' ? 'រក្សាទុក' : 'Save') : (language === 'km' ? 'បង្កើត' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
