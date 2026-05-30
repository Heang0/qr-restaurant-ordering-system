'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ModalPortal from '@/components/Portal';

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
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
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
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ email: user.email, password: '', role: user.role, storeId: user.store_id || '', full_name: user.full_name || '' });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openResetModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetMessage({ type: '', text: '' });
    setShowResetModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = (users || []).filter(user =>
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
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
      const body = editingUser
        ? { full_name: formData.full_name, storeId: formData.storeId, role: formData.role }
        : { ...formData, role: formData.role };
      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.message || 'An error occurred' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setResetMessage({ type: 'error', text: language === 'km' ? 'ពាក្យសម្ងាត់មិនត្រូវគ្នា' : 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setResetMessage({ type: 'error', text: language === 'km' ? 'ពាក្យសម្ងាត់ត្រូវការ 6 តួអក្សរ' : 'Password must be at least 6 characters' });
      return;
    }
    setIsResetting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${selectedUser?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        setResetMessage({ type: 'success', text: language === 'km' ? 'ពាក្យសម្ងាត់ត្រូវបានកំណត់ឡើងវិញ!' : 'Password reset successfully!' });
        setTimeout(() => setShowResetModal(false), 1500);
      } else {
        const err = await res.json();
        setResetMessage({ type: 'error', text: err.message || 'Reset failed' });
      }
    } catch {
      setResetMessage({ type: 'error', text: 'Reset failed' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setShowDeleteModal(false);
        fetchUsers();
      }
    } catch {
      console.error('Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-5 w-10"><div className="h-4 w-4 bg-gray-50 rounded"></div></td>
      <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-gray-50"></div><div className="space-y-2"><div className="h-4 w-24 bg-gray-100 rounded-full"></div><div className="h-3 w-32 bg-gray-50 rounded-full"></div></div></div></td>
      <td className="px-8 py-5"><div className="h-4 w-24 bg-gray-100 rounded-full"></div></td>
      <td className="px-8 py-5"><div className="h-6 w-16 bg-gray-50 rounded-lg"></div></td>
      <td className="px-8 py-5 text-right"><div className="flex gap-2 justify-end"><div className="w-9 h-9 bg-gray-50 rounded-xl"></div><div className="w-9 h-9 bg-gray-50 rounded-xl"></div><div className="w-9 h-9 bg-gray-50 rounded-xl"></div></div></td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-full relative">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់' : 'User Management'}
          </h2>
          <p className={`text-xs text-gray-400 mt-1 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? `${filteredUsers.length} អ្នកប្រើប្រាស់សរុប` : `${filteredUsers.length} total users`}
          </p>
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
              placeholder={language === 'km' ? 'ស្វែងរកអ្នកប្រើប្រាស់...' : 'Search users...'}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-all text-sm shadow-sm placeholder:text-gray-400 ${language === 'km' ? 'font-khmer' : ''}`}
            />
          </div>
          <button onClick={openCreateModal} className={`bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ${language === 'km' ? 'font-khmer' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតថ្មី' : 'Create New'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto custom-scrollbar touch-pan-x">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 w-10">
                  <input type="checkbox" checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-200 text-primary focus:ring-primary cursor-pointer" />
                </th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'អ្នកប្រតិបត្តិ' : 'Operator'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ហាង' : 'Store'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'សិទ្ធិប្រើប្រាស់' : 'Role'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ថ្ងៃបង្កើត' : 'Created'}</th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest text-right ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <>{[...Array(itemsPerPage)].map((_, i) => <SkeletonRow key={i} />)}</>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold">{searchQuery ? 'No users found' : 'No users yet'}</td></tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedUserIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-8 py-5">
                      <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="w-4 h-4 rounded border-gray-200 text-primary cursor-pointer" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 ring-2 ring-white shadow-sm">
                          {user.profile_image ? <img src={user.profile_image} alt="PF" className="w-full h-full object-cover" /> : <span className="font-black text-sm uppercase">{user.email.charAt(0)}</span>}
                        </div>
                        <div>
                          <p className={`font-bold text-gray-900 text-sm ${language === 'km' ? 'font-khmer' : ''}`}>{user.full_name || 'No Name'}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-xs font-bold text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                        {user.store_id ? (stores.find(s => s.id === user.store_id)?.name || 'Linked Store') : '--'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-gray-400 font-semibold">{new Date(user.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(user)}
                          title={language === 'km' ? 'កែសម្រួល' : 'Edit'}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                        </button>
                        {/* Reset Password */}
                        <button
                          onClick={() => openResetModal(user)}
                          title={language === 'km' ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Reset Password'}
                          className="p-2.5 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        </button>
                        {/* Delete — only if not superadmin */}
                        {user.role !== 'superadmin' && (
                          <button
                            onClick={() => openDeleteModal(user)}
                            title={language === 'km' ? 'លុប' : 'Delete'}
                            className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white border border-gray-100 text-gray-400 hover:border-primary hover:text-primary'}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}

      {/* ── Create / Edit User Modal ── */}
      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn pointer-events-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                    {editingUser ? (language === 'km' ? 'កែសម្រួលអ្នកប្រើ' : 'Edit User') : (language === 'km' ? 'បង្កើតអ្នកប្រើថ្មី' : 'Create New User')}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleFormSubmit}>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}</label>
                      <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className={`w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all text-sm ${language === 'km' ? 'font-khmer' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>Email</label>
                      <input type="email" required value={formData.email} disabled={!!editingUser} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all text-sm disabled:opacity-60" />
                    </div>
                    {!editingUser && (
                      <div className="space-y-2">
                        <label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'}</label>
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all text-sm" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ចាត់តាំងទៅហាង' : 'Assign to Store'}</label>
                      <select value={formData.storeId} onChange={(e) => setFormData({ ...formData, storeId: e.target.value })} className={`w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary outline-none transition-all text-sm ${language === 'km' ? 'font-khmer' : ''}`}>
                        <option value="">{language === 'km' ? '--- ជ្រើសរើសហាង ---' : '--- Select Store ---'}</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    {message.text && (
                      <div className={`px-4 py-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{message.text}</div>
                    )}
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បោះបង់' : 'Cancel'}</button>
                    <button type="submit" className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{editingUser ? (language === 'km' ? 'រក្សាទុក' : 'Save') : (language === 'km' ? 'បង្កើត' : 'Create')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Reset Password Modal ── */}
      {showResetModal && selectedUser && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowResetModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scaleIn pointer-events-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-amber-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'Reset Password'}</h3>
                      <p className="text-[10px] text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowResetModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleResetPassword}>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}</label>
                      <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-amber-400 outline-none transition-all text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-[13px] text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'}</label>
                      <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-amber-400 outline-none transition-all text-sm" />
                    </div>
                    {resetMessage.text && (
                      <div className={`px-4 py-3 rounded-xl text-xs font-bold ${resetMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{resetMessage.text}</div>
                    )}
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <button type="button" onClick={() => setShowResetModal(false)} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បោះបង់' : 'Cancel'}</button>
                    <button type="submit" disabled={isResetting} className={`flex-1 py-2.5 rounded-xl text-white bg-amber-500 font-semibold hover:bg-amber-600 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                      {isResetting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      {language === 'km' ? 'កំណត់ឡើងវិញ' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && selectedUser && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowDeleteModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scaleIn pointer-events-auto">
                <div className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </div>
                  <h3 className={`text-base font-bold text-gray-900 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'លុបអ្នកប្រើ?' : 'Delete User?'}</h3>
                  <p className={`text-xs text-gray-400 mb-6 ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? `${selectedUser.full_name || selectedUser.email} នឹងត្រូវបានលុប។ ការសម្រេចនេះមិនអាចត្រឡប់វិញបានទេ។` : `"${selectedUser.full_name || selectedUser.email}" will be permanently deleted. This cannot be undone.`}
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-200 font-semibold text-sm hover:bg-gray-50 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បោះបង់' : 'Cancel'}</button>
                    <button onClick={handleDeleteUser} disabled={isDeleting} className={`flex-1 py-2.5 rounded-xl text-white bg-red-500 font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                      {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      {language === 'km' ? 'លុប' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default UsersView;
