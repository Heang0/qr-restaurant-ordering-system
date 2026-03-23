'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  _id: string;
  email: string;
  role: 'superadmin' | 'admin';
  storeId?: string;
  createdAt: string;
}

interface Store {
  _id: string;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'superadmin',
    storeId: '',
    name: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Also get superadmins
        const allUsersResponse = await fetch('/api/users/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => null);
        
        let allUsers = data;
        if (allUsersResponse && allUsersResponse.ok) {
          const superadmins = await allUsersResponse.json();
          allUsers = [...superadmins, ...data];
        }
        setUsers(allUsers);
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: language === 'km' ? 'អ្នកប្រើប្រាស់ត្រូវបានបង្កើត!' : 'User created successfully!' });
        setShowCreateModal(false);
        setFormData({ email: '', password: '', role: 'admin', storeId: '', name: '' });
        fetchUsers();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred' });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(language === 'km' ? 'តើអ្នកចង់លុបមែនទេ?' : 'Are you sure you want to delete?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: language === 'km' ? 'អ្នកប្រើប្រាស់ត្រូវបានលុប!' : 'User deleted!' });
        fetchUsers();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setMessage({ type: 'error', text: language === 'km' ? 'ពាក្យសម្ងាត់មិនដូចគ្នាទេ!' : 'Passwords do not match!' });
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: language === 'km' ? 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៦ តួអក្សរ' : 'Password must be at least 6 characters' });
      return;
    }

    try {
      if (!selectedUser) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: resetPasswordData.newPassword })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: language === 'km' ? 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរ!' : 'Password reset successfully!' });
        setShowResetPasswordModal(false);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
        setSelectedUser(null);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Failed to reset password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់' : 'User Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'km' ? 'បង្កើតអ្នកប្រើប្រាស់' : 'Create User'}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'អ៊ីមែល' : 'Email'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'តួនាទី' : 'Role'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ហាង' : 'Store'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'កាលបរិច្ឆេទ' : 'Created'}
                </th>
                <th className={`px-6 py-4 text-center text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'សកម្មភាព' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      {language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading...'}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    {language === 'km' ? 'មិនមានអ្នកប្រើប្រាស់ទេ' : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'superadmin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'superadmin' 
                          ? (language === 'km' ? 'សូពែរអ្ដមិន' : 'Superadmin') 
                          : (language === 'km' ? 'អ្ដមិន' : 'Admin')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {user.storeId ? stores.find(s => s._id === user.storeId)?.name || 'Unknown' : '-'}
                    </td>
                    <td className={`px-6 py-4 text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetPasswordModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title={language === 'km' ? 'ផ្លាស់ប្តូរពាក្យសម្ងាត់' : 'Reset Password'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'បង្កើតអ្នកប្រើប្រាស់ថ្មី' : 'Create New User'}
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
                  {language === 'km' ? 'អ៊ីមែល' : 'Email'}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'example@email.com' : 'example@email.com'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ពាក្យសម្ងាត់' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'កំណត់ពាក្យសម្ងាត់' : 'Set password'}
                  minLength={6}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'តួនាទី' : 'Role'}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'superadmin' })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                >
                  <option value="admin">{language === 'km' ? 'អ្ដមិន (គ្រប់គ្រងហាង)' : 'Admin (Manage Store)'}</option>
                  <option value="superadmin">{language === 'km' ? 'សូពែរអ្ដមិន (គ្រប់គ្រងទាំងអស់)' : 'Superadmin (Manage All)'}</option>
                </select>
              </div>

              {formData.role === 'admin' && (
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'ហាង' : 'Store'}
                  </label>
                  <select
                    value={formData.storeId}
                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  >
                    <option value="">{language === 'km' ? 'ជ្រើសរើសហាង' : 'Select Store'}</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}

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

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'ផ្លាស់ប្តូរពាក្យសម្ងាត់' : 'Reset Password'}
              </h3>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setResetPasswordData({ newPassword: '', confirmPassword: '' });
                  setSelectedUser(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {language === 'km' ? 'កំពុងផ្លាស់ប្តូរពាក្យសម្ងាត់សម្រាប់:' : 'Resetting password for:'}
                </p>
                <p className={`font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{selectedUser.email}</p>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ពាក្យសម្ងាត់ថ្មី' : 'New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី' : 'Enter new password'}
                  minLength={6}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត' : 'Confirm new password'}
                  minLength={6}
                />
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResetPasswordData({ newPassword: '', confirmPassword: '' });
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {language === 'km' ? 'ផ្លាស់ប្តូរ' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
