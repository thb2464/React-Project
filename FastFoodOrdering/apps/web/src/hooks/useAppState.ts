// apps/web/src/hooks/useAppState.ts
import { useState, useEffect } from 'react';
import { MenuItemType } from '../types';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'operator';
};

type CartItem = MenuItemType & { quantity: number };

export function useAppState() {
  const [cart, setCart] = useState<CartItem[]>([
    // ... your cart items ...
  ]);

  const [user, setUser] = useState<User | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('foodie_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('foodie_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('foodie_user');
    }
  }, [user]);

const addToCart = (item: MenuItemType) => {
    const existingItem = cart.find((i) => i.id === item.id);
    if (existingItem) {
      updateQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return removeFromCart(id);
    setCart(cart.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    user,
    setUser,
  };
}