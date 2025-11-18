// apps/web/src/hooks/useCart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Định nghĩa kiểu dữ liệu món ăn trong giỏ
export interface CartItem {
  id: number;
  name: string;
  image: string;
  price?: number;
  discountedPrice?: number;
  quantity: number;
  selectedOptions?: Array<{
    name: string;
    value: string;
    extra?: number;
  }>;
  [key: string]: any;
}

// Tạo store giỏ hàng
interface CartStore {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) => set((state) => {
        const existingIndex = state.cart.findIndex(
          (i) =>
            i.id === item.id &&
            JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
        );

        if (existingIndex >= 0) {
          // Đã có → tăng số lượng
          const updated = [...state.cart];
          updated[existingIndex].quantity += 1;
          return { cart: updated };
        } else {
          // Chưa có → thêm mới
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }
      }),

      removeFromCart: (index) => set((state) => ({
        cart: state.cart.filter((_, i) => i !== index)
      })),

      updateQuantity: (index, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter((_, i) => i !== index) };
        }
        const updated = [...state.cart];
        updated[index].quantity = quantity;
        return { cart: updated };
      }),

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () => get().cart.reduce((sum, item) => {
        const price = item.discountedPrice || item.price || 0;
        const optionsPrice = item.selectedOptions?.reduce((s, opt) => s + (opt.extra || 0), 0) || 0;
        return sum + (price + optionsPrice) * item.quantity;
      }, 0),
    }),
    {
      name: 'foodie-cart', // Lưu vào localStorage
    }
  )
);