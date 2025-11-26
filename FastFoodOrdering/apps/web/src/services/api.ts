// apps/web/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://chiasmal-puffingly-etsuko.ngrok-free.dev/api';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'https://chiasmal-puffingly-etsuko.ngrok-free.dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    // 👇 THIS IS THE VIP PASS. It tells Ngrok "I am a developer, let me through".
    'ngrok-skip-browser-warning': 'true' 
  },
});
// Auto-add JWT token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Safe image URL
const getImageUrl = (img_url: string | null) => {
  if (!img_url || img_url.includes('null') || img_url.trim() === '') {
    return 'https://placehold.co/600x400/e67e22/white?text=FoodieExpress&font=roboto';
  }
  return `${SERVER_BASE_URL}/uploads/${img_url}`;
};

// === AUTH ===
export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (full_name: string, email: string, password: string) => {
  const res = await api.post('/auth/register', { full_name, email, password });
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateCurrentUser = async (data: any) => {
  const res = await api.put('/auth/me', data);
  return res.data;
};

// === RESTAURANTS ===
export const getAllRestaurants = async () => {
  const res = await api.get('/restaurants');
  // CHỈ LẤY NHÀ HÀNG ĐANG MỞ (is_open = true)
  return res.data.filter((r: any) => r.is_open === true);
};

export const getNearbyRestaurants = async (lat: number, lng: number) => {
  const res = await api.get(`/restaurants/nearby?lat=${lat}&lng=${lng}`);
  // CHỈ LẤY NHÀ HÀNG ĐANG MỞ
  return res.data.filter((r: any) => r.is_open === true);
};
// === MENU (GLOBAL) ===
// apps/web/src/services/api.ts

export const getFoodMenu = async () => {
  try {
    const res = await api.get('/food-items');
    
    // --- DEBUG: See what the server actually sent ---
    console.log("Server Menu Response:", res.data);

    // FIX: Check if it is an array. If not, it's likely an error object.
    if (!Array.isArray(res.data)) {
      console.error("API Error: Expected an array but got:", res.data);
      return [];
    }

    return res.data.map((item: any) => ({
      item_id: item.item_id,
      name: item.name,
      category: item.category || 'Khác',
      img_url: item.img_url,
      image: getImageUrl(item.img_url),
      price: Number(item.price) || 0,
      description: item.description,
      is_veg: item.is_veg || false,
      options: item.options || [],
      is_popular: item.is_popular || false,
    }));
  } catch (err) {
    console.error('Failed to load menu:', err);
    return [];
  }
};

export const getCurrentOrder = async () => {
  const res = await api.get('/orders/current');
  return res.data; // trả về đơn đang giao hoặc null
};

export const getOrderHistory = async () => {
  const res = await api.get('/orders/history');
  return res.data;
};

export const getDroneById = async (droneId: string) => {
  const res = await api.get(`/drones/${droneId}`);
  return res.data;
};

// === DRONES ===
export const getDronesByRestaurant = async (restaurantId: string) => {
  // This replaces the mock data in CheckoutPage
  const res = await api.get(`/drones/restaurant/${restaurantId}`);
  return res.data;
};

// === VNPAY & ORDERS ===

// 1. Create Order
// Called from CheckoutPage to create the 'pending' order
export const createOrder = async (orderData: any) => {
  const res = await api.post('/orders', orderData); // axios handles JSON stringify
  return res.data;
};

// 2. Get VNPAY URL
// Called from CheckoutPage after order is created
export const getVnpayUrl = async (paymentData: { 
  orderId: number | string; 
  amount: number; 
  orderInfo: string 
}) => {
  const res = await api.post('/vnpay/create_payment_url', paymentData);
  return res.data;
};

// 3. Verify VNPAY Return
// Called from PaymentSuccessPage to verify the transaction
export const verifyVnpayReturn = async (queryString: string) => {
  // queryString will be like "?vnp_Amount=..."
  // This will make a GET request to:
  // /api/vnpay/vnpay_return?vnp_Amount=...
  const res = await api.get(`/vnpay/vnpay_return${queryString}`); 
  return res.data;
};

export default api;