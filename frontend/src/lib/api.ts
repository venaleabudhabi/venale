import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export interface MenuItem {
  _id?: string;
  key: string;
  name: string;
  price: number;
  ingredients: string[];
  tags: string[];
  addons?: string[];
  nutrition: {
    calories_kcal?: number;
    carbs_g?: number;
    protein_g?: number;
    fiber_g?: number;
    fat_g?: number;
    micros?: string[];
  };
}

export interface MenuCategory {
  _id?: string;
  key: string;
  name: string;
  imageUrl?: string;
  items: MenuItem[];
}

export interface AddonGroup {
  key: string;
  name: string;
  min_select: number;
  max_select: number;
  options: {
    key: string;
    name: string;
    price: number;
  }[];
}

export interface MenuData {
  venue: {
    name: string;
    currency: string;
    delivery_enabled: boolean;
    member_discount_percent: number;
    member_discount_note: string;
    loyalty_note: string;
  };
  categories: MenuCategory[];
  addonGroups: AddonGroup[];
}

export const menuApi = {
  getMenu: (lang: string = 'en') =>
    api.get<MenuData>(`/menu/${process.env.NEXT_PUBLIC_VENUE_SLUG}`, { params: { lang } }),

  searchMenu: (query: string, lang: string = 'en') =>
    api.get(`/menu/${process.env.NEXT_PUBLIC_VENUE_SLUG}/search`, { params: { q: query, lang } }),
};

export interface CreateOrderInput {
  venueSlug: string;
  channel: 'QR' | 'WEB';
  customer: {
    name?: string;
    phone: string;
  };
  fulfillment: {
    type: 'PICKUP' | 'DELIVERY';
    address?: string;
    notes?: string;
    lat?: number;
    lng?: number;
  };
  payment: {
    method: 'COD' | 'CARD';
  };
  items: {
    itemKey: string;
    qty: number;
    selectedAddons?: {
      groupKey: string;
      optionKey: string;
    }[];
  }[];
  isMember: boolean;
}

export const orderApi = {
  createOrder: (data: CreateOrderInput) => api.post('/orders', data),
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

export const paymentApi = {
  createCheckout: (orderId: string) => api.post('/payments/checkout', { orderId }),
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Admin API
export const adminApi = {
  // Categories
  getCategories: () =>
    api.get('/admin/categories', { headers: getAuthHeaders() }),
  createCategory: (data: any) =>
    api.post('/admin/categories', data, { headers: getAuthHeaders() }),
  updateCategory: (id: string, data: any) =>
    api.patch(`/admin/categories/${id}`, data, { headers: getAuthHeaders() }),
  deleteCategory: (id: string) =>
    api.delete(`/admin/categories/${id}`, { headers: getAuthHeaders() }),

  // Items
  getItems: (categoryId?: string) =>
    api.get('/admin/items', { params: { categoryId }, headers: getAuthHeaders() }),
  createItem: (data: any) =>
    api.post('/admin/items', data, { headers: getAuthHeaders() }),
  updateItem: (id: string, data: any) =>
    api.patch(`/admin/items/${id}`, data, { headers: getAuthHeaders() }),
  deleteItem: (id: string) =>
    api.delete(`/admin/items/${id}`, { headers: getAuthHeaders() }),

  // Orders
  getOrders: (status?: string) =>
    api.get('/admin/orders', { params: { status }, headers: getAuthHeaders() }),
  updateOrderStatus: (id: string, status: string, driverId?: string) =>
    api.patch(`/admin/orders/${id}/status`, { status, driverId }, { headers: getAuthHeaders() }),

  // Venue Settings
  getVenueSettings: () =>
    api.get('/admin/venue/settings', { headers: getAuthHeaders() }),
  updateVenueSettings: (data: any) =>
    api.patch('/admin/venue/settings', data, { headers: getAuthHeaders() }),
};
