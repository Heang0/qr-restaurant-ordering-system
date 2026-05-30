'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import ModalPortal from '@/components/Portal';
import { optimizeImage } from '@/utils/imageOptimizer';
import { MenuSkeleton } from '@/components/admin/Skeletons';
import { EmptyState } from '@/components/admin/EmptyState';

interface MenuItem {
  id?: string;
  _id?: string;
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  categoryId?: string | { id?: string; _id?: string };
  isAvailable: boolean;
  options?: Array<{ name: string; nameKm: string; price: number }>;
}

interface Category {
  id?: string;
  _id?: string;
  name: string;
  nameKm?: string;
}

interface MenuViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const MenuView: React.FC<MenuViewProps> = ({ language, t }) => {
  const toast = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameKm: '',
    description: '',
    descriptionKm: '',
    price: '',
    categoryId: '',
    isAvailable: true,
    options: [] as Array<{ name: string; nameKm: string; price: number }>
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterAvailable, setFilterAvailable] = useState<string>('all'); // all, available, unavailable

  const getMenuItemId = (item: MenuItem) => item.id || item._id || '';
  const getCategoryId = (category: Category) => category.id || category._id || '';
  const getCategoryRefId = (categoryId: MenuItem['categoryId']) =>
    typeof categoryId === 'object' && categoryId !== null ? categoryId.id || categoryId._id : categoryId;

  useEffect(() => {
    const isAnyModalOpen = showCreateModal || showEditModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
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
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      const response = await fetch(`/api/menu?storeId=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Optimize image before upload (max 600x600 for product images)
      const optimizedFile = await optimizeImage(file, 600);
      
      const formData = new FormData();
      formData.append('file', optimizedFile);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');

      let imageUrl = imageFile ? await uploadImage(imageFile) : (editingItem?.imageUrl || undefined);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        storeId: editingItem ? undefined : storeId,
        image: imageUrl
      };

      const url = editingItem
        ? `/api/menu/${getMenuItemId(editingItem)}`
        : '/api/menu';

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(language === 'km' ? (editingItem ? 'មុខម្ហូបត្រូវបានកែសម្រួល!' : 'មុខម្ហូបត្រូវបានបង្កើត!') : (editingItem ? 'Menu item updated!' : 'Menu item created!'));
        setShowEditModal(false);
        setShowCreateModal(false);
        setFormData({ name: '', nameKm: '', description: '', descriptionKm: '', price: '', categoryId: '', isAvailable: true, options: [] });
        setImageFile(null);
        setImagePreview('');
        setEditingItem(null);
        fetchMenuItems();
      } else {
        if (data.message === 'PLAN_LIMIT_REACHED') {
          toast.error(language === 'km' ? 'ឈានដល់ដែនកំណត់! សូមដំឡើងកញ្ចប់សេវាកម្មរបស់អ្នក។' : 'Limit Reached! Please upgrade your plan in the Billing tab.');
        } else {
          toast.error(data.message || 'Failed to save menu item');
          alert('SYSTEM ERROR:\n' + JSON.stringify(data, null, 2));
        }
      }
    } catch (error: any) {
      toast.error(language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred');
      alert('NETWORK/APP ERROR:\n' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      nameKm: item.nameKm || '',
      description: item.description || '',
      descriptionKm: item.descriptionKm || '',
      price: String(item.price),
      categoryId: getCategoryRefId(item.categoryId) || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      options: item.options || []
    });
    if (item.imageUrl) {
      setImagePreview(item.imageUrl);
    }
    setShowEditModal(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm(language === 'km' ? 'តើអ្នកចង់លុបមែនទេ?' : 'Are you sure?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(language === 'km' ? 'មុខម្ហូបត្រូវបានលុប!' : 'Menu item deleted!');
        fetchMenuItems();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', nameKm: '', price: 0 }]
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nameKm && item.nameKm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter - handle both string IDs and objects
    const itemCategoryId = getCategoryRefId(item.categoryId);
    const matchesCategory = selectedCategory === 'all' || !itemCategoryId || itemCategoryId === selectedCategory;

    // Availability filter
    const matchesAvailability = filterAvailable === 'all' ||
      (filterAvailable === 'available' && item.isAvailable) ||
      (filterAvailable === 'unavailable' && !item.isAvailable);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const getCategoryName = (categoryId: any) => {
    // Handle both string ID and object
    const catId = getCategoryRefId(categoryId);
    
    if (!catId || catId === '') return language === 'km' ? 'ទូទៅ' : 'General';
    
    const category = categories.find(c => getCategoryId(c) === catId);
    return category ? (language === 'km' && category.nameKm ? category.nameKm : category.name) : (language === 'km' ? 'ទូទៅ' : 'General');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងម៉ឺនុយ' : 'Menu Catalog'}
          </h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className={`bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap w-full sm:w-auto ${language === 'km' ? 'font-khmer' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតមុខម្ហូប' : 'Add New Item'}</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="md:col-span-2">
            <div className="relative group">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'km' ? 'ស្វែងរកមុខម្ហូប...' : 'Search for dishes, drinks...'}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none transition-all text-sm shadow-sm placeholder:text-gray-400 ${language === 'km' ? 'font-khmer' : ''}`}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none appearance-none transition-all text-sm shadow-sm ${language === 'km' ? 'font-khmer' : ''}`}
            >
              <option value="all" className="font-normal">{language === 'km' ? 'ប្រភេទទាំងអស់' : 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={getCategoryId(cat)} value={getCategoryId(cat)}>
                  {language === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <select
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-primary outline-none appearance-none transition-all text-sm shadow-sm ${language === 'km' ? 'font-khmer' : ''}`}
            >
              <option value="all">{language === 'km' ? 'ទាំងអស់' : 'All Status'}</option>
              <option value="available">{language === 'km' ? 'មាន' : 'In Stock'}</option>
              <option value="unavailable">{language === 'km' ? 'អស់' : 'Out of Stock'}</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
          <p className={`text-xs font-bold text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' 
              ? `បង្ហាញ ${filteredItems.length} ក្នុងចំណោម ${menuItems.length} មុខម្ហូប` 
              : `Found ${filteredItems.length} items`}
          </p>
          {(searchQuery || selectedCategory !== 'all' || filterAvailable !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterAvailable('all');
              }}
              className="text-xs font-black text-primary hover:text-primary-dark uppercase tracking-widest flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              {language === 'km' ? 'លុបចោលតម្រង' : 'Clear filters'}
            </button>
          )}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6"><MenuSkeleton /></div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-gray-500 font-semibold text-sm">
               {language === 'km' ? 'មិនមានមុខម្ហូបដែលត្រូវនឹងតម្រងរបស់អ្នកទេ' : 'No menu items found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ផលិតផល' : 'Product'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ប្រភេទ' : 'Category'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'តម្លៃ' : 'Price'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className={`px-6 py-4 text-right ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={getMenuItemId(item)} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Small Image Thumbnail */}
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {!item.isAvailable && (
                             <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
                          )}
                        </div>
                        {/* Name & Desc */}
                        <div>
                          <p className={`text-sm font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                            {language === 'km' && item.nameKm ? item.nameKm : item.name}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                              {language === 'km' && item.descriptionKm ? item.descriptionKm : item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">${parseFloat(String(item.price)).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                       <button
                         onClick={() => toggleAvailability(getMenuItemId(item), item.isAvailable)}
                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                           item.isAvailable
                             ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                             : 'bg-red-50 text-red-700 hover:bg-red-100'
                         } ${language === 'km' ? 'font-khmer' : ''}`}
                       >
                         <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         {item.isAvailable ? (language === 'km' ? 'មានស្តុក' : 'In Stock') : (language === 'km' ? 'អស់ស្តុក' : 'Out of Stock')}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                            title="Edit"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(getMenuItemId(item))}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Menu Item Modal */}
      {showCreateModal && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Separate Backdrop Layer */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowCreateModal(false)}
          />
          
          {/* Scroll Container */}
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none py-10">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                  <h3 className={`text-lg text-gray-900 font-bold ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? 'បង្កើតមុខម្ហូបថ្មី' : 'Create New Menu Item'}
                  </h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Modal Body - Scrollable Form */}
                <form onSubmit={handleSubmit} className="flex flex-col bg-white">
                  <div className="p-6 sm:p-10 space-y-8 custom-scrollbar">
                    {/* Image Upload */}
                    <div className="space-y-3">
                      <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                        {language === 'km' ? 'រូបភាពមុខម្ហូប' : 'Item Presentation Image'}
                      </label>
                      <div className="flex items-center gap-6">
                        {imagePreview ? (
                          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-md">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { setImageFile(null); setImagePreview(''); }}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-transform active:scale-90"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3 group-hover:text-primary">Click to Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        )}
                        <div className="flex-1 text-xs text-gray-400 leading-relaxed font-medium">
                          {language === 'km' ? 'បង្ហោះរូបភាពច្បាស់ល្អដើម្បីទាក់ទាញភ្ញៀវ។ ទំហំដែលណែនាំគឺ 800x800px ។' : 'Upload a high-quality image to attract more customers. Recommended size: 800x800px.'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer text-lg' : 'font-sans font-black'}`}
                          placeholder="e.g., Wagyu Beef Burger"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                        </label>
                        <input
                          type="text"
                          value={formData.nameKm}
                          onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer text-lg' : 'font-sans font-black'}`}
                          placeholder="ឧ. បឺហ្គឺរសាច់គោវ៉ាហ្គូ"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ការពិពណ៌នា (អង់គ្លេស)' : 'Description (English)'}
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none min-h-[100px] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                          placeholder="Detail about the ingredients..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ការពិពណ៌នា (ខ្មែរ)' : 'Description (Khmer)'}
                        </label>
                        <textarea
                          value={formData.descriptionKm}
                          onChange={(e) => setFormData({ ...formData, descriptionKm: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none min-h-[100px] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                          placeholder="ព័ត៌មានអំពីគ្រឿងផ្សំ..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'តម្លៃ ($)*' : 'Base Price ($)*'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className={`w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ប្រភេទ' : 'Menu Category'}
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        >
                          <option value="">{language === 'km' ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'}</option>
                          {categories.map((cat) => (
                            <option key={getCategoryId(cat)} value={getCategoryId(cat)}>
                              {language === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Options Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                            {language === 'km' ? 'ជម្រើសបន្ថែម' : 'Dish Customization'}
                          </label>
                          <p className="text-[10px] text-gray-300 font-medium tracking-tight">Add variants like Size, Spicy level, etc.</p>
                        </div>
                        <button
                          type="button"
                          onClick={addOption}
                          className="h-10 px-4 bg-gray-50 border border-gray-100 text-[10px] font-black text-primary uppercase tracking-[0.15em] rounded-xl flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                          {language === 'km' ? 'បន្ថែម' : 'Add Item'}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {formData.options.map((option, idx) => (
                          <div key={idx} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 relative group animate-scaleIn">
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 shadow-sm transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Name (EN)</span>
                                <input
                                  type="text"
                                  value={option.name}
                                  onChange={(e) => updateOption(idx, 'name', e.target.value)}
                                  placeholder="Large / Spicy / etc."
                                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary outline-none text-xs font-bold"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Name (KM)</span>
                                <input
                                  type="text"
                                  value={option.nameKm}
                                  onChange={(e) => updateOption(idx, 'nameKm', e.target.value)}
                                  placeholder="ឈ្មោះជម្រើស"
                                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary outline-none text-xs font-khmer"
                                />
                              </div>
                              <div className="sm:col-span-2 space-y-1.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Extra Charge ($)</span>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={option.price}
                                    onChange={(e) => updateOption(idx, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 focus:border-primary outline-none text-sm font-black tabular-nums"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-primary/5 p-5 rounded-[2rem] border border-primary/10">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="isAvailable"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="isAvailable" className={`text-sm font-black text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ដាក់លក់ក្នុងម៉ឺនុយ' : 'Enable in Menu Catalog'}
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Visible to customers immediately</span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer - Fixed */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                    <button type="button" onClick={() => setShowCreateModal(false)} disabled={uploading} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : ''}`}>
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button type="submit" disabled={uploading} className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>{language === 'km' ? 'បង្កើតមុខម្ហូប' : 'Create Item'}</span>
                      )}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Edit Menu Item Modal */}
      {showEditModal && editingItem && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowEditModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none py-10">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                  <h3 className={`text-lg text-gray-900 font-bold ${language === 'km' ? 'font-khmer' : ''}`}>
                    {language === 'km' ? 'កែសម្រួលមុខម្ហូប' : 'Edit Menu Item'}
                  </h3>
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingItem(null); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Modal Body - Scrollable Form */}
                <form onSubmit={handleSubmit} className="flex flex-col bg-white">
                  <div className="p-6 sm:p-10 space-y-8 custom-scrollbar">
                    {/* Image Upload - Same Pattern */}
                    <div className="space-y-3">
                      <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                        {language === 'km' ? 'រូបភាពមុខម្ហូប' : 'Item Presentation Image'}
                      </label>
                      <div className="flex items-center gap-6">
                        {imagePreview ? (
                          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-md">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => { setImageFile(null); setImagePreview(''); }}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-transform active:scale-90"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3 group-hover:text-primary">Click to Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer text-lg' : 'font-sans font-black'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                        </label>
                        <input
                          type="text"
                          value={formData.nameKm}
                          onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer text-lg' : 'font-sans font-black'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'តម្លៃ ($)*' : 'Base Price ($)*'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className={`w-full pl-10 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-black text-lg ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ប្រភេទ' : 'Menu Category'}
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className={`w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                        >
                          <option value="">{language === 'km' ? 'ជ្រើសរើសប្រភេទ' : 'Select Category'}</option>
                          {categories.map((cat) => (
                            <option key={getCategoryId(cat)} value={getCategoryId(cat)}>
                              {language === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Options Section - Same Pattern */}
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                        <label className={`block text-[11px] text-gray-400 uppercase tracking-[0.2em] font-black ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                          {language === 'km' ? 'ជម្រើសបន្ថែម' : 'Dish Customization'}
                        </label>
                        <button
                          type="button"
                          onClick={addOption}
                          className="h-10 px-4 bg-gray-50 border border-gray-100 text-[10px] font-black text-primary uppercase tracking-[0.15em] rounded-xl flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                          {language === 'km' ? 'បន្ថែម' : 'Add Item'}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {formData.options.map((option, idx) => (
                          <div key={idx} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 relative group animate-scaleIn">
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-100 text-gray-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 shadow-sm transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => updateOption(idx, 'name', e.target.value)}
                                placeholder="Name (EN)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary outline-none text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={option.nameKm}
                                onChange={(e) => updateOption(idx, 'nameKm', e.target.value)}
                                placeholder="ឈ្មោះជម្រើស"
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-primary outline-none text-xs font-khmer"
                              />
                              <div className="sm:col-span-2 relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={option.price}
                                    onChange={(e) => updateOption(idx, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 focus:border-primary outline-none text-sm font-black tabular-nums"
                                  />
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-primary/5 p-5 rounded-[2rem] border border-primary/10">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="isAvailableEdit"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                      <label htmlFor="isAvailableEdit" className={`text-sm font-black text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                        {language === 'km' ? 'ដាក់លក់ក្នុងម៉ឺនុយ' : 'Enable in Menu Catalog'}
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer - Fixed */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                    <button type="button" onClick={() => { setShowEditModal(false); setEditingItem(null); }} disabled={uploading} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : ''}`}>
                      {language === 'km' ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button type="submit" disabled={uploading} className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>{language === 'km' ? 'រក្សាទុក' : 'Save Changes'}</span>
                      )}
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

export default MenuView;
