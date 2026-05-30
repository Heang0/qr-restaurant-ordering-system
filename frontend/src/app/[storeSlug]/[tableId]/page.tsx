'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { MenuItem as MenuItemType, CartItem, Order } from '@/types';
import Header from '@/components/order/Header';
import MenuGrid from '@/components/order/MenuGrid';
import Cart from '@/components/order/Cart';
import SideMenu from '@/components/order/SideMenu';
import FloatingCartButton from '@/components/order/FloatingCartButton';
import OrderConfirmation from '@/components/order/OrderConfirmation';
import ImageModal from '@/components/order/ImageModal';
import CustomerOrders from '@/components/order/CustomerOrders';

function OrderContent() {
  const params = useParams();
  const { t, language } = useLanguage();

  const storeSlug = params.storeSlug as string || 'orderhey';
  const urlTableSlug = params.tableId as string || 'A1';

  const [resolvedTableId, setResolvedTableId] = useState<string>(urlTableSlug);

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([{ _id: 'all', name: t('common.all'), nameKm: 'ទាំងអស់' }]);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'menu' | 'orders' | 'checkout' || 'menu';
  
  const [activeTab, setActiveTabState] = useState<'menu' | 'orders' | 'checkout'>(initialTab);

  // Sync state to URL
  const setActiveTab = (tab: 'menu' | 'orders' | 'checkout') => {
    setActiveTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Fetch store and menu
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        const storeResponse = await fetch(`/api/stores?slug=${storeSlug}`);
        if (storeResponse.ok) {
          const storeData = await storeResponse.json();
          setStore(storeData);
          localStorage.setItem('storeId', storeData.id);
          localStorage.setItem('storeSlug', storeData.slug);

          const menuResponse = await fetch(`/api/menu?storeId=${storeData.id}`);
          if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            setMenuItems(menuData);

            const categoryMap = new Map();
            categoryMap.set('all', { _id: 'all', name: t('common.all'), nameKm: 'ទាំងអស់' });
            
            menuData.forEach((item: any) => {
              // Check categories (plural) which is where backend joins it
              const category = item.categories || (typeof item.categoryId === 'object' ? item.categoryId : null);
              
              if (category && (category.id || category._id)) {
                const catId = String(category.id || category._id);
                categoryMap.set(catId, category);
              }
            });
            setCategories(Array.from(categoryMap.values()));
          }

          // Resolve table slug to real UUID
          const tablesResponse = await fetch(`/api/tables?storeId=${storeData.id}`);
          if (tablesResponse.ok) {
            const tablesData = await tablesResponse.json();
            const matchingTable = tablesData.find((t: any) => 
              t.name.toLowerCase().replace(/\s+/g, '-') === urlTableSlug.toLowerCase() || 
              t.id === urlTableSlug
            );
            if (matchingTable) {
              setResolvedTableId(matchingTable.id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load menu:', err);
        setError('Failed to load menu. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, [storeSlug]);

  // Fetch orders
  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (store && resolvedTableId && uuidRegex.test(resolvedTableId)) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [store, resolvedTableId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?storeId=${store.id}&tableId=${resolvedTableId}&status=active`);
      if (response.ok) {
        const data = await response.json();
        const mappedOrders = data.map((order: any) => ({
          ...order,
          totalAmount: Number(order.total_price || order.total_amount || 0),
          createdAt: order.created_at
        }));
        
        // If orders were present and now they are gone, it means the table was cleared
        if (orders.length > 0 && mappedOrders.length === 0) {
          clearCart();
        }
        
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const addToCart = (item: MenuItemType, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        menuItemId: item.id,
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
        store_id: store.id,
        table_id: resolvedTableId,
        items: cart.map(item => ({ 
          menu_item_id: item.menuItemId, 
          quantity: item.quantity, 
          price: item.price,
          name: item.name,
          image: item.image,
          remark: item.notes || '' 
        })),
        total_price: cartTotal * 1.1, // Including VAT
        status: 'pending'
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
    const categoryId = typeof item.categoryId === 'object' ? item.categoryId.id : item.categoryId;
    const matchesCategory = selectedCategory === 'all' || !categoryId || String(categoryId) === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.nameKm?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header 
        tableId={urlTableSlug.toUpperCase()} 
        language={language} 
        storeName={store?.name || 'Loading...'} 
        storeLogo={store?.logo_url || store?.logo} 
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onTabChange={setActiveTab} 
        activeTab={activeTab}
        storeName={store?.name}
        storeLogo={store?.logo_url || store?.logo}
      />

      {activeTab === 'menu' && (
        <main className="max-w-screen-xl mx-auto px-5 py-8 pb-32">
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
      )}

      {activeTab === 'orders' && (
        <CustomerOrders orders={orders} language={language} t={t} />
      )}

      {activeTab === 'checkout' && (
        <Cart
          isOpen={true}
          onClose={() => setActiveTab('menu')}
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
      )}

      {activeTab === 'menu' && (
        <FloatingCartButton 
          count={cartCount} 
          totalPrice={cartTotal}
          onClick={() => setActiveTab('checkout')}
          language={language}
        />
      )}

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
