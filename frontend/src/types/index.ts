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
  rating?: number;
  reviewsCount?: number;
  prepTime?: string;
  isPopular?: boolean;
  options?: Array<{ name: string; nameKm: string; price: number }>;
}

export interface CartItem {
  cartItemId?: string; // Unique key for item + options combination
  menuItemId: string;
  name: string;
  nameKm?: string;
  price: number;
  image?: string;
  quantity: number;
  remark?: string;
  selectedOptions?: Array<{ name: string; nameKm: string; price: number }>;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  nameKm?: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
  remark?: string;
  options?: Array<{ name: string; nameKm: string; price: number }>;
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
