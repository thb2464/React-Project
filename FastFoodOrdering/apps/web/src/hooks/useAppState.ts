// apps/web/src/hooks/useAppState.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // For localStorage
import { MenuItemType } from '../types';

// Types
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'operator';
};

type CartItem = MenuItemType & { quantity: number };

type AppState = {
  cart: CartItem[];
  user: User | null;
  addToCart: (item: MenuItemType & { quantity: number }) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  removeFromCart: (id: string) => void;
  setUser: (user: User | null) => void;
  clearCart: () => void;
};

// Global Store with Persistence
export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [
        {
          id: '11',
          name: 'Spicy Jalapeno Pizza [Regular 7"]',
          description:
            'Tangy, Spicy Jalapenos with Mozzarella & Molten Cheese. 100% Dairy Cheese | 0% Mayonnaise',
          originalPrice: 195,
          discountedPrice: 99,
          image: 'https://assets.box8.co.in/rectangle-19x10/xhdpi/product/8074',
          veg: true,
          tags: ['Vegetarian', 'Gluten Free Option'],
          isPopular: true,
          rating: 4.5,
          time: '15-20 min',
          calories: 400,
          quantity: 2,
        },
        {
          id: '12',
          name: 'Golden Corn Pizza [Regular 7"]',
          description:
            'Golden Corn with Mozzarella & Molten Cheese. 100% Dairy Cheese | 0% Mayonnaise',
          originalPrice: 195,
          discountedPrice: 99,
          image: 'https://assets.box8.co.in/rectangle-19x10/xhdpi/product/7753',
          veg: true,
          tags: ['Vegetarian', 'Gluten Free Option'],
          isPopular: true,
          rating: 4.6,
          time: '15-20 min',
          calories: 380,
          quantity: 1,
        },
      ],
      user: null,

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

      updateQuantity: (id, newQuantity) =>
        set((state) => ({
          cart:
            newQuantity === 0
              ? state.cart.filter((i) => i.id !== id)
              : state.cart.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)),
        })),

      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),

      setUser: (user) => set({ user }),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'foodie-state', // localStorage key
      partialize: (state) => ({ user: state.user, cart: state.cart }), // Persist only user/cart
    }
  )
);