'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MenuItem as MenuItemType, CartItem, Order } from '@/types';
import Header from '@/components/order/Header';
import MenuGrid from '@/components/order/MenuGrid';
import Cart from '@/components/order/Cart';
import BottomNav from '@/components/order/BottomNav';
import FloatingCartButton from '@/components/order/FloatingCartButton';
import OrderConfirmation from '@/components/order/OrderConfirmation';
import ImageModal from '@/components/order/ImageModal';
import CustomerOrders from '@/components/order/CustomerOrders';

function OrderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const storeSlug = params.storeSlug as string || 'orderhey';
  const tableId = searchParams.get('table') || 'A1';
  const modalItemId = searchParams.get('modal');

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([{ _id: 'all', name: t('common.all'), nameKm: 'ទាំងអស់' }]);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');

  // Fetch store and menu
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const storeResponse = await fetch(`/api/stores?slug=${storeSlug}`);
        if (!storeResponse.ok) {
          setError('Store not found');
          setIsLoading(false);
          return;
        }
        
        const storeData = await storeResponse.json();
        if (!storeData || !storeData._id) {
          setError('Store not found');
          setIsLoading(false);
          return;
        }
        
        setStore(storeData);
        localStorage.setItem('storeId', storeData._id);
        localStorage.setItem('storeSlug', storeData.slug);

        const menuResponse = await fetch(`/api/menu?storeId=${storeData._id}`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenuItems(menuData);

          const categoryMap = new Map();
          categoryMap.set('all', { _id: 'all', name: t('common.all'), nameKm: 'ទាំងអស់' });
          menuData.forEach((item: MenuItemType) => {
            if (item.categoryId && typeof item.categoryId === 'object' && item.categoryId._id) {
              categoryMap.set(String(item.categoryId._id), item.categoryId);
            }
          });
          setCategories(Array.from(categoryMap.values()));
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
        setError('Failed to load menu. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, [storeSlug, t]);

  // Fetch orders
  useEffect(() => {
    if (store) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [store]);

  const fetchOrders = async () => {
    try {
      const tableId = searchParams.get('table') || 'A1';
      const response = await fetch(`/api/orders?storeId=${store._id}&tableId=${tableId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const addToCart = (item: MenuItemType, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item._id);
      if (existing) {
        return prev.map(i => i.menuItemId === item._id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        menuItemId: item._id,
        name: item.name,
        nameKm: item.nameKm,
        price: item.price,
        image: item.imageUrl,
        quantity,
      }];
    });
  };

  const removeFromCart = (menuItemId: string) => setCart(prev => prev.filter(i => i.menuItemId !== menuItemId));
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(menuItemId); return; }
    setCart(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
  };
  const updateNotes = (menuItemId: string, notes: string) => {
    setCart(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, notes } : i));
  };
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async () => {
    try {
      const orderData = {
        storeId: store._id,
        tableId: tableId,
        items: cart.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity, remark: item.notes || '' }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        clearCart();
        setIsConfirmationOpen(true);
        fetchOrders();
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order');
    }
  };

  const handleImageClick = (item: MenuItemType) => {
    setSelectedItem(item);
    setIsImageModalOpen(true);
  };

  const handleCloseModal = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('modal');
    window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    setIsImageModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddToCartFromModal = (notes: string) => {
    if (selectedItem) {
      const itemWithNotes = { ...selectedItem, notes };
      addToCart(itemWithNotes, 1);
      handleCloseModal();
    }
  };

  const filteredItems = menuItems.filter(item => {
    const categoryId = typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId;
    const matchesCategory = selectedCategory === 'all' || !categoryId || String(categoryId) === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.nameKm?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header tableId={tableId} language={language} storeName={store?.name || 'Loading...'} storeLogo={store?.logoUrl} />

      {activeTab === 'menu' ? (
        <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
          <MenuGrid
            items={filteredItems}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddToCart={addToCart}
            isLoading={isLoading}
            error={error}
            language={language}
            t={t}
            onImageClick={handleImageClick}
          />
        </main>
      ) : (
        <CustomerOrders orders={orders} language={language} t={t} />
      )}

      <FloatingCartButton count={cartCount} onClick={() => setIsCartOpen(true)} />

      <BottomNav
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        t={t}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        total={cartTotal}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onUpdateNotes={updateNotes}
        onSubmitOrder={handleSubmitOrder}
        language={language}
        t={t}
      />

      <OrderConfirmation
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        language={language}
        t={t}
      />

      {isImageModalOpen && selectedItem && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartFromModal}
          imageUrl={selectedItem.imageUrl || selectedItem.image || ''}
          itemName={selectedItem.name}
          itemNameKm={selectedItem.nameKm}
          description={selectedItem.description}
          descriptionKm={selectedItem.descriptionKm}
          price={selectedItem.price}
          language={language}
        />
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <OrderContent />
    </Suspense>
  );
}
