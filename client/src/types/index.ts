export interface MenuItemAddon {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  prepTimeMinutes: number;
  addons: MenuItemAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

export interface TableInfo {
  id: string;
  tableNumber: string;
  qrToken: string;
  capacity: number;
  status: string;
}

export interface RestaurantInfo {
  name: string;
  tagline: string;
  currency: string;
  taxRate: number;
}

export interface CustomerSession {
  id: string;
  name: string;
  mobile: string;
  partySize: number;
  token: string;
  tableId: string;
  tableNumber: string;
  qrToken?: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AdminOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  isVeg: boolean;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  addons: Array<{ id: string; name: string; price: number }>;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  status: 'PLACED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  subtotalAmount?: number;
  taxesAndCharges?: number;
  totalAmount: number;
  customerNotes?: string | null;
  chefAssigned?: string | null;
  servedAt?: string | null;
  feedbackRating?: number | null;
  feedbackComment?: string | null;
  trackingToken: string;
  createdAt: string;
  updatedAt: string;
  prepTimeMinutes: number;
  items: AdminOrderItem[];
}

export interface AdminOverviewStats {
  totalOrdersToday: number;
  placedCount: number;
  preparingCount: number;
  readyCount: number;
  servedCount: number;
  cancelledCount: number;
  activeOrdersCount: number;
  totalRevenueToday: number;
  tablesTotal: number;
  tablesOccupied: number;
  tablesAvailable: number;
  categoriesCount: number;
  menuItemsCount: number;
}
