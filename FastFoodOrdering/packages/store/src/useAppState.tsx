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
      placeOrder: async (deliveryAddress) => {
        const { cart, token } = get();
        if (!token) throw new Error('You must be logged in to order.');
        if (cart.length === 0) throw new Error('Cart is empty.');

        const items = cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity
        }));

        const restaurantId = cart[0].restaurant_id || 1; 
        
        // Removed totalAmount calculation from here and payload
        
        await apiClient('/orders', 'POST', {
          restaurant_id: restaurantId,
          delivery_address: deliveryAddress,
          items: items,
          payment_method: 'COD' 
        }, token);

        set({ cart: [] });
      },
    }),
    {
      name: 'foodie-state',
      storage: createJSONStorage(() => storageAdapter),
      partialize: (state) => ({ user: state.user, token: state.token, cart: state.cart }),
    }
  )
);