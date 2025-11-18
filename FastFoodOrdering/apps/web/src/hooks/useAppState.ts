// apps/web/src/hooks/useAppState.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: 'customer' | 'admin' | 'owner';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  cart: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  loadPersistedState: () => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),

      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: quantity === 0
            ? state.cart.filter((i) => i.id !== id)
            : state.cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ cart: [] }),

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      logout: () => {
        set({ user: null, token: null, cart: [] });
        localStorage.removeItem('appState');
      },

      loadPersistedState: () => {
        const persisted = localStorage.getItem('appState');
        if (persisted) {
          try {
            const parsed = JSON.parse(persisted);
            set({
              user: parsed.state?.user || null,
              token: parsed.state?.token || null,
              cart: parsed.state?.cart || [],
            });
          } catch (e) {
            console.error('Parse persisted state failed', e);
          }
        }
      },
    }),
    {
      name: 'appState',
    }
  )
);