import axios from 'axios';

// API Base URL
const API_BASE_URL = 'https://api.pamoontoy.site';
// For local development, use: http://localhost:5000

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminAuth');
      
      // Redirect to appropriate login page
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminRoute ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const apiService = {
  // Authentication
  auth: {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (credentials) => api.post('/api/auth/login', credentials),
    getProfile: () => api.get('/api/auth/me'),
  },

  // Products
  products: {
    getAll: (params = {}) => api.get('/api/products', { params }),
    getById: (id) => api.get(`/api/products/${id}`),
    create: (productData) => api.post('/api/products', productData),
    update: (id, productData) => api.put(`/api/products/${id}`, productData),
    delete: (id) => api.delete(`/api/products/${id}`),
    uploadImages: (productId, formData) => api.post(`/api/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    getViewHistory: () => api.get('/api/products/user/view-history'),
  },

  // Bids
  bids: {
    placeBid: (productId, bidData) => api.post(`/api/bids/products/${productId}/bid`, bidData),
    buyNow: (productId) => api.post(`/api/bids/products/${productId}/buy-now`),
    getProductBids: (productId) => api.get(`/api/bids/products/${productId}/bids`),
    getUserBids: () => api.get('/api/bids/user/bids'),
  },

  // Admin
  admin: {
    getUsers: () => api.get('/api/admin/users'),
    getAdminUsers: () => api.get('/api/admin/admin-users'),
    getUserById: (id) => api.get(`/api/admin/users/${id}`),
    createUser: (userData) => api.post('/api/admin/users', userData),
    updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  },

  // Upload
  upload: {
    images: (formData) => api.post('/api/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    paymentProof: (formData) => api.post('/api/upload/payment-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },

  // Categories
  categories: {
    getAll: (params = {}) => api.get('/api/categories', { params }),
    getById: (id) => api.get(`/api/categories/${id}`),
    create: (categoryData) => api.post('/api/categories', categoryData),
    update: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/api/categories/${id}`),
    reorder: (categories) => api.post('/api/categories/reorder', { categories }),
  },

  // Favorites
  favorites: {
    getAll: () => api.get('/api/favorites'),
    add: (productId) => api.post('/api/favorites', { product_id: productId }),
    remove: (productId) => api.delete(`/api/favorites/${productId}`),
    check: (productId) => api.get(`/api/favorites/check/${productId}`),
    toggle: (productId) => api.post('/api/favorites/toggle', { product_id: productId }),
  },

  // Orders
  orders: {
    getAll: () => api.get('/api/orders'),
    getById: (id) => api.get(`/api/orders/${id}`),
    create: (data) => api.post('/api/orders', data),
    submitPayment: (id, data) => api.post(`/api/orders/${id}/payment`, data),
    cancel: (id) => api.post(`/api/orders/${id}/cancel`),
    bulkPayment: (data) => api.post('/api/orders/bulk-payment', data),
    // Admin
    getAllAdmin: (params) => api.get('/api/orders/admin/all', { params }),
    confirmPayment: (id, data) => api.put(`/api/orders/admin/${id}/confirm`, data),
    updateShipping: (id, data) => api.put(`/api/orders/admin/${id}/shipping`, data),
  },

  // Dashboard
  dashboard: {
    getStats: () => api.get('/api/dashboard/stats'),
    getActivities: (params) => api.get('/api/dashboard/activities', { params }),
    getSalesChart: (params) => api.get('/api/dashboard/sales-chart', { params }),
    getTopProducts: (params) => api.get('/api/dashboard/top-products', { params }),
    getLatestOrders: (params) => api.get('/api/dashboard/latest-orders', { params }),
    getPopularProducts: (params) => api.get('/api/dashboard/popular-products', { params }),
    getQuickStats: () => api.get('/api/dashboard/quick-stats'),
  },

  // Discounts
  discounts: {
    getAll: (params) => api.get('/api/discounts', { params }),
    getById: (id) => api.get(`/api/discounts/${id}`),
    create: (data) => api.post('/api/discounts', data),
    update: (id, data) => api.put(`/api/discounts/${id}`, data),
    delete: (id) => api.delete(`/api/discounts/${id}`),
    toggle: (id) => api.patch(`/api/discounts/${id}/toggle`),
    getUsage: (id) => api.get(`/api/discounts/${id}/usage`),
    validate: (code) => api.get(`/api/discounts/validate/${code}`),
  },

  // Health check
  health: () => api.get('/health'),
};

export { api };
export default apiService;

