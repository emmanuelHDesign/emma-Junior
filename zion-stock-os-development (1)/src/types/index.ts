// Types pour ZION STOCK OS

export type UserRole = 'admin' | 'magasinier' | 'vendeur';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  warehouseId?: string;
  avatar?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  location: string;
  manager?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  costPrice?: number;
  unit: string;
  minStock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  lastUpdated: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
  productId: string;
  warehouseId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  totalStockValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  movementsToday: number;
  recentMovements: StockMovement[];
  topProducts: { product: Product; totalQuantity: number }[];
  stockByWarehouse: { warehouse: Warehouse; totalValue: number; itemCount: number }[];
}
