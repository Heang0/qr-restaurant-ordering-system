'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
import CustomerNotification from '@/components/order/CustomerNotification';
import SplashScreen from '@/components/order/SplashScreen';
import PaymentModal from '@/components/order/PaymentModal';
import AlertModal from '@/components/order/AlertModal';

function OrderContent() {
  const params = useParams();
  const { t, language } = useLanguage();

  const storeSlug = params.storeSlug as string || 'orderhey';
  const tableParams = params.tableParams as string[] || [];
  const urlTableSlug = tableParams[0] || 'A1';
  const urlTab = tableParams[1] as 'menu' | 'orders' | undefined;

  const [resolvedTableId, setResolvedTableId] = useState<string>(urlTableSlug);

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({ isOpen: false, title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertModalConfig({ isOpen: true, title, message });
  };

  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentOrderAmount, setCurrentOrderAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [store, setStore] = useState<any>(null);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`seen_notifs_${urlTableSlug}`);
    if (saved) setSeenNotificationIds(JSON.parse(saved));
  }, [urlTableSlug]);

  const markNotificationsAsSeen = () => {
    const activeIds = orders
      .filter(o => o.status !== 'pending')
      .map(o => o.id);
    const newSeen = Array.from(new Set([...seenNotificationIds, ...activeIds]));
    setSeenNotificationIds(newSeen);
    localStorage.setItem(`seen_notifs_${urlTableSlug}`, JSON.stringify(newSeen));
  };

  const unreadCount = orders
    .filter(o => o.status !== 'pending' && !seenNotificationIds.includes(o.id))
    .reduce((sum, o) => sum + o.items.length, 0);
  const [categories, setCategories] = useState<any[]>([{ _id: 'all', name: t('common.all'), nameKm: 'ទាំងអស់' }]);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();
  const initialTab = urlTab || 'menu';
  
  const [activeTab, setActiveTabState] = useState<'menu' | 'orders'>(initialTab);

  useEffect(() => {
    if (urlTab === 'menu' || urlTab === 'orders') {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  // Sync state to URL without reloading
  const setActiveTab = (tab: 'menu' | 'orders') => {
    setActiveTabState(tab);
    window.history.pushState({}, '', `/${storeSlug}/${urlTableSlug}/${tab}`);
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
            console.log('--- DEBUG MENU FETCH ---');
            console.log('Store ID:', storeData.id);
            console.log('Menu Data:', menuData);
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
    if (store && resolvedTableId && uuidRegex.test(resolvedTableId) && menuItems.length > 0) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [store, resolvedTableId, menuItems]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?storeId=${store.id}&tableId=${resolvedTableId}&status=active`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const mappedOrders = data.map((order: any) => ({
          ...order,
          items: order.items.map((item: any) => {
            const menuItem = menuItems.find(m => m.id === item.menu_item_id);
            return {
              ...item,
              nameKm: menuItem?.nameKm || item.name_km || ''
            };
          }),
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

  const addToCart = (item: MenuItemType, quantity: number = 1, selectedOptions: any[] = []) => {
    setCart(prev => {
      // Calculate effective price with options
      const optionsTotal = selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
      const effectivePrice = item.price + optionsTotal;

      // Unique key for item + options combination
      const optionsKey = selectedOptions.map(o => o.name).sort().join('|');
      const cartItemId = `${item.id}-${optionsKey}`;

      const existing = prev.find(i => i.cartItemId === cartItemId);
      
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId 
          ? { ...i, quantity: i.quantity + quantity } 
          : i
        );
      }

      return [...prev, {
        cartItemId,
        menuItemId: item.id,
        name: item.name,
        nameKm: item.nameKm,
        price: effectivePrice,
        image: item.imageUrl,
        quantity,
        selectedOptions: selectedOptions,
        remark: (item as any).remark || (item as any).notes || ''
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(cartItemId); return; }
    setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i));
  };
  const updateRemark = (cartItemId: string, remark: string) => {
    setCart(prev => prev.map(i => i.cartItemId === cartItemId ? { ...i, remark } : i));
  };
  const clearCart = () => setCart([]);

  const handleRequestBill = async () => {
    try {
      const response = await fetch(`/api/tables/${resolvedTableId}/request-bill`, {
        method: 'PATCH'
      });
      if (response.ok) {
        showAlert(
          language === 'km' ? 'ជោគជ័យ' : 'Success',
          language === 'km' ? 'បានស្នើសុំវិក្កយបត្រ! សូមរង់ចាំបន្តិច។' : 'Bill requested! Please wait for the cashier.'
        );
      } else {
        showAlert(
          language === 'km' ? 'បរាជ័យ' : 'Error',
          language === 'km' ? 'មានបញ្ហាក្នុងការស្នើសុំ' : 'Failed to request bill'
        );
      }
    } catch (error) {
      console.error('Request bill error:', error);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async () => {
    try {
      const orderAmount = cartTotal * 1.1; // Including VAT
      const orderData = {
        store_id: store.id,
        table_id: resolvedTableId,
        items: cart.map(item => ({ 
          menu_item_id: item.menuItemId, 
          quantity: item.quantity, 
          price: item.price,
          name: item.name,
          image: item.image,
          remark: item.remark || '',
          options: item.selectedOptions
        })),
        total_price: orderAmount,
        status: 'pending'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        clearCart();
        
        // Show success modal and switch to orders tab
        setIsConfirmationOpen(true);
        setActiveTab('orders');
        
        fetchOrders();
      } else {
        showAlert(
          language === 'km' ? 'បរាជ័យ' : 'Error',
          language === 'km' ? 'បញ្ជាទិញមិនបានជោគជ័យ' : 'Failed to place order'
        );
      }
    } catch (error) {
      console.error('Order error:', error);
      showAlert(
        language === 'km' ? 'បរាជ័យ' : 'Error',
        'Failed to place order'
      );
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setIsConfirmationOpen(true);
    fetchOrders();
  };

  const callWaiter = async () => {
    try {
      const response = await fetch('/api/tables/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: store?.id, 
          tableId: resolvedTableId,
          tableNumber: urlTableSlug.toUpperCase()
        })
      });
      if (response.ok) {
        showAlert(
          language === 'km' ? 'ជោគជ័យ' : 'Success',
          language === 'km' ? 'បុគ្គលិកនឹងមកដល់ក្នុងពេលឆាប់ៗនេះ!' : 'A staff member will be with you shortly!'
        );
      }
    } catch (error) {
      console.error('Failed to call waiter:', error);
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

  const handleAddToCartFromModal = (remark: string, selectedOptions: any[]) => {
    if (selectedItem) {
      const itemWithRemark = { ...selectedItem, remark };
      addToCart(itemWithRemark, 1, selectedOptions);
      handleCloseModal();
    }
  };

  const filteredItems = menuItems.filter(item => {
    const categoryId = item.categoryId && typeof item.categoryId === 'object' ? item.categoryId.id : item.categoryId;
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
        onNotificationClick={() => {
          setIsNotificationOpen(true);
          markNotificationsAsSeen();
        }}
        unreadCount={unreadCount}
      />

      {activeTab === 'menu' && (
        <main className="max-w-screen-xl mx-auto px-5 py-4 pb-48">
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
        <main className="max-w-screen-xl mx-auto px-5 py-4 pb-48">
          <CustomerOrders orders={orders} language={language} t={t} onRequestBill={handleRequestBill} />
        </main>
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        total={cartTotal}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onUpdateRemark={updateRemark}
        onSubmitOrder={handleSubmitOrder}
        language={language}
        t={t}
      />

      {activeTab === 'menu' && !isCartOpen && (
        <FloatingCartButton 
          count={cartCount} 
          totalPrice={cartTotal}
          onClick={() => setIsCartOpen(true)}
          language={language}
        />
      )}

      <OrderConfirmation
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        language={language}
        t={t}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setIsConfirmationOpen(true);
        }}
        orderId={currentOrderId}
        storeId={store?.id || ''}
        amount={currentOrderAmount}
        language={language}
        t={t}
        onPaymentSuccess={handlePaymentSuccess}
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
          options={selectedItem.options}
        />
      )}

      <CustomerNotification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        language={language}
        t={t}
        notifications={orders.flatMap(o => {
          return o.items.map((item, idx) => {
            const displayItemName = language === 'km' && item.nameKm ? item.nameKm : item.name;
            return {
              id: `${o.id}-${idx}`,
              status: o.status,
              image: item.image,
              itemName: displayItemName,
              quantity: item.quantity,
              title: language === 'km' 
                ? (o.status === 'ready' || o.status === 'completed' ? 'រួចរាល់ហើយ' : o.status === 'preparing' ? 'កំពុងរៀបចំ...' : 'កំពុងរង់ចាំ')
                : (o.status === 'ready' || o.status === 'completed' ? 'Order Ready!' : o.status === 'preparing' ? 'Preparing...' : 'Pending'),
              message: language === 'km'
                ? `មុខម្ហូប "${displayItemName}" ${o.status === 'ready' || o.status === 'completed' ? 'រួចរាល់សម្រាប់អ្នកហើយ' : o.status === 'preparing' ? 'កំពុងស្ថិតក្នុងការរៀបចំ' : 'កំពុងរង់ចាំ'}`
                : `Your "${displayItemName}" is ${o.status === 'ready' || o.status === 'completed' ? 'now ready to serve' : o.status === 'preparing' ? 'currently being prepared' : 'waiting in queue'}.`,
              time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
        })}
      />

      <BottomNav
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        t={t}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <AlertModal
        isOpen={alertModalConfig.isOpen}
        onClose={() => setAlertModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertModalConfig.title}
        message={alertModalConfig.message}
        language={language}
      />

      <SplashScreen 
        storeName={store?.name || 'OrderHey!'} 
        logo={store?.logo_url || store?.logo} 
        language={language} 
      />
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
