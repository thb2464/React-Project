// apps/web/src/hooks/useAppState.ts
import { useState } from 'react'
import { MenuItemType } from '../types'

type CartItem = MenuItemType & { quantity: number };

export function useAppState() {
  const [cart, setCart] = useState<CartItem[]>([
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
  ]);

  const addToCart = (item: MenuItemType) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      updateQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return removeFromCart(id);
    setCart(cart.map((item) => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return { cart, addToCart, updateQuantity, removeFromCart };
}