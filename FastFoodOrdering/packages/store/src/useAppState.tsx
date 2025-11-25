import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MenuItemType, User } from '@fastfoodordering/types';
import { apiClient } from '@fastfoodordering/utils';

// Smart Storage Adapter (Web vs Mobile)
const storageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window !== 'undefined') return localStorage.getItem(name);
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') localStorage.setItem(name, value);
    else {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window !== 'undefined') localStorage.removeItem(name);
    else {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem(name);
    }
  },
};

export type CartItem = MenuItemType & { quantity: number };

type AppState = {
  cart: CartItem[];
  user: User | null;
  token: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  
  addToCart: (item: MenuItemType) => void;
  removeFromCart: (item_id: number) => void;
  updateQuantity: (item_id: number, quantity: number) => void;
  clearCart: () => void;
  
  placeOrder: (deliveryAddress: string) => Promise<void>;
};

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      user: null,
      token: null,

      login: async (email, password) => {
        const data = await apiClient('/auth/login', 'POST', { email, password });
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        set({ user: null, token: null, cart: [] });
      },

      addToCart: (item) =>
        set((state) => {
          // Use item_id to match database
          const existing = state.cart.find((i) => i.item_id === item.item_id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),

      updateQuantity: (item_id, quantity) =>
        set((state) => ({
          cart: quantity === 0
            ? state.cart.filter((i) => i.item_id !== item_id)
            : state.cart.map((i) => (i.item_id === item_id ? { ...i, quantity } : i)),
        })),

      removeFromCart: (item_id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.item_id !== item_id) })),

      clearCart: () => set({ cart: [] }),

      // --- THE ORDER FUNCTION ---
      placeOrder: async (deliveryAddress: string, note = '') => {
        const { cart, token, user } = get();
        
        if (!token || !user) throw new Error('Bạn cần đăng nhập để đặt hàng');
        if (cart.length === 0) throw new Error('Giỏ hàng trống');

        // Tính total từ cart (giá thực tế)
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const items = cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.price // giá mỗi món
        }));

        const restaurantId = cart[0].restaurant_id || 1;
        
        const orderData = {
          restaurant_id: restaurantId,
          total_amount: total,        // ← ĐÚNG TÊN CỘT TRONG DB (mặc dù backend cũng chấp nhận total)
          total: total,               // ← GỬI CẢ 2 ĐỂ AN TOÀN
          delivery_address: deliveryAddress,
          note: note || null,
          items: items,
          payment_method: 'COD'
        };
        
        console.log('Đang gửi đơn hàng:', orderData);
        // Removed totalAmount calculation from here and payload
        
        try {
            await apiClient('/orders', 'POST', orderData, token);
            
            // XÓA GIỎ HÀNG SAU KHI ĐẶT THÀNH CÔNG
            set({ cart: [] });
            
            console.log('Đặt hàng thành công!');
          } catch (error: any) {
            console.error('Lỗi đặt hàng:', error);
            throw new Error(error.message || 'Không thể đặt hàng');
          }
        },
    }),
    {
      name: 'foodie-state',
      storage: createJSONStorage(() => storageAdapter),
      partialize: (state) => ({ user: state.user, token: state.token, cart: state.cart }),
    }
  )
);