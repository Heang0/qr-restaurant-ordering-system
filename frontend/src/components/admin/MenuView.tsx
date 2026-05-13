'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
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
    isAvailable: true
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
      // Optimize image before upload
      const optimizedFile = await optimizeImage(file);
      
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
        setFormData({ name: '', nameKm: '', description: '', descriptionKm: '', price: '', categoryId: '', isAvailable: true });
        setImageFile(null);
        setImagePreview('');
        setEditingItem(null);
        fetchMenuItems();
      } else {
        toast.error(data.message || 'Failed to save menu item');
      }
    } catch (error) {
      toast.error(language === 'km' ? 'មានកំហុសកើតឡើង' : 'An error occurred');
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
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
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
          <h2 className={`text-xl sm:text-2xl font-black text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងម៉ឺនុយ' : 'Menu Catalog'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage your offerings</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className={`bg-primary text-white px-6 py-4 rounded-2xl font-normal text-[14px] uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap w-full sm:w-auto ${language === 'km' ? 'font-khmer px-8' : 'font-sans'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតមុខម្ហូប' : 'Add New Item'}</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="card-premium mb-8">
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
                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-normal shadow-sm placeholder:text-gray-300 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all font-normal shadow-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
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
              className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none appearance-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
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

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <MenuSkeleton />
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
               {language === 'km' ? 'មិនមានមុខម្ហូបដែលត្រូវនឹងតម្រងរបស់អ្នកទេ' : 'No menu items found'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={getMenuItemId(item)} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 group flex gap-6 p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              {/* Image */}
              <div className="w-32 h-32 flex-shrink-0 rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {!item.isAvailable && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-white/90 px-2 py-1 rounded shadow-sm">Sold Out</span>
                   </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                   <div className="min-w-0">
                      <h3 className={`text-lg text-gray-900 tracking-tight truncate ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                        {language === 'km' && item.nameKm ? item.nameKm : item.name}
                      </h3>
                      <p className={`text-xs text-gray-400 font-medium truncate mt-0.5 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km' && item.descriptionKm ? item.descriptionKm : item.description}
                      </p>
                   </div>
                   <div className="text-xl font-black text-primary tracking-tight">${parseFloat(String(item.price)).toFixed(2)}</div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                   <span className={`text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100 font-normal ${language === 'km' ? 'font-khmer' : ''}`}>{getCategoryName(item.categoryId)}</span>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between">
                   <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm border border-gray-100"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(getMenuItemId(item))}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-gray-100"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>

                   <button
                     onClick={() => toggleAvailability(getMenuItemId(item), item.isAvailable)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       item.isAvailable
                         ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                         : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                     }`}
                   >
                     {item.isAvailable ? (language === 'km' ? 'ធ្វើឱ្យអស់' : 'Set Out of Stock') : (language === 'km' ? 'ធ្វើឱ្យមាន' : 'Set In Stock')}
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Menu Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 overflow-y-auto p-4 py-8">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/10 animate-scaleIn">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                <h3 className={`text-xl text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' ? 'បង្កើតមុខម្ហូបថ្មី' : 'Create New Menu Item'}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              {/* Image Upload */}
              <div>
                <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'រូបភាព' : 'Item Image'}
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500 mt-2">Upload</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="e.g., Beef Lok Lak"
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameKm}
                    onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="ឧ. ល្ហុងសាច់គោ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (អង់គ្លេស)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="Describe the dish..."
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (ខ្មែរ)' : 'Description (Khmer)'}
                  </label>
                  <textarea
                    value={formData.descriptionKm}
                    onChange={(e) => setFormData({ ...formData, descriptionKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="ពិពណ៌នាអំពីមុខម្ហូប..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'តម្លៃ ($)*' : 'Price ($)*'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ប្រភេទ' : 'Category'}
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isAvailable" className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'មានក្នុងម៉ឺនុយ' : 'Available in menu'}
                </label>
              </div>

                </div>

                {/* Modal Footer - Fixed */}
                <div className="p-6 border-t border-gray-100 bg-white flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={uploading}
                    className={`flex-1 px-6 py-4 border border-gray-200 bg-white rounded-2xl text-[13px] font-normal uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : ''}`}
                  >
                    {language === 'km' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{language === 'km' ? 'កំពុងបង្ហោះ...' : 'Uploading...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{language === 'km' ? 'បង្កើត' : 'Create'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 overflow-y-auto p-4 py-8">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/10 animate-scaleIn">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className={`text-xl text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' ? 'កែសម្រួលមុខម្ហូប' : 'Edit Menu Item'}
                </h3>
                <button
                  onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                  className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              {/* Image Upload - Same as Create Modal */}
              <div>
                <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'រូបភាព' : 'Item Image'}
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500 mt-2">{language === 'km' ? 'បង្ហោះ' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Rest of form fields - Same as Create Modal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (អង់គ្លេស)*' : 'Name (English)*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="e.g., Beef Lok Lak"
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ឈ្មោះ (ខ្មែរ)' : 'Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameKm}
                    onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="ឧ. ល្ហុងសាច់គោ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (អង់គ្លេស)' : 'Description (English)'}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="Describe the dish..."
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ការពិពណ៌នា (ខ្មែរ)' : 'Description (Khmer)'}
                  </label>
                  <textarea
                    value={formData.descriptionKm}
                    onChange={(e) => setFormData({ ...formData, descriptionKm: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    rows={2}
                    placeholder="ពិពណ៌នាអំពីមុខម្ហូប..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'តម្លៃ ($)*' : 'Price ($)*'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <label className={`block text-[13px] text-gray-400 uppercase tracking-widest mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                    {language === 'km' ? 'ប្រភេទ' : 'Category'}
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailableEdit"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isAvailableEdit" className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'មានក្នុងម៉ឺនុយ' : 'Available in menu'}
                </label>
              </div>

                </div>

                {/* Modal Footer - Fixed */}
                <div className="p-6 border-t border-gray-100 bg-white flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                    disabled={uploading}
                    className={`flex-1 px-6 py-4 border border-gray-200 bg-white rounded-2xl text-[13px] font-normal uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : ''}`}
                  >
                    {language === 'km' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{language === 'km' ? 'រក្សាទុក' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuView;
