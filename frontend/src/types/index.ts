export interface MenuItem {
  id: string;
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  price: number;
  imageUrl?: string;
  image?: string;
  categoryId?: any;
  storeId?: string;
  isAvailable: boolean;
  order?: number;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  nameKm?: string;
  price: number;
  image?: string;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  storeId: string;
  order: number;
  isActive: boolean;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export interface Table {
  id: string;
  name: string;
  slug: string;
  storeId: string;
  qrCode?: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  storeId?: string;
}
